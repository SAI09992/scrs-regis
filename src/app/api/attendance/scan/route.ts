import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { attendance, registrations, payments, users } from '@/db/schema';
import { attendanceScanSchema } from '@/lib/validation';
import { requireAdmin } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';
import { broadcastRealtimeEvent } from '@/lib/realtime';
import { and, eq, or, sql } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { registrationId, day, session } = attendanceScanSchema.parse(body);

    // 1. Locate registration
    const regList = await db
      .select({
        registration: registrations,
        payment: payments,
      })
      .from(registrations)
      .leftJoin(payments, eq(registrations.id, payments.registrationId))
      .where(eq(registrations.registrationId, registrationId.trim().toUpperCase()))
      .limit(1);

    if (regList.length === 0) {
      return NextResponse.json({ success: false, error: 'Registration not found' }, { status: 404 });
    }

    const { registration, payment } = regList[0];

    // Ensure payment is verified before marking attendance
    if (!payment || payment.status !== 'verified') {
      return NextResponse.json(
        {
          success: false,
          error: `Payment is not verified (Status: ${payment?.status || 'unpaid'}). Verify payment before marking attendance.`,
        },
        { status: 400 }
      );
    }

    // 2. Check if already marked for this day & session
    const existing = await db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.registrationId, registration.id),
          eq(attendance.day, day),
          eq(attendance.session, session)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({
        success: true,
        alreadyMarked: true,
        message: `Attendance already marked for Day ${day} (${session})`,
        participant: {
          name: registration.name,
          registrationId: registration.registrationId,
          department: registration.department,
          creditType: registration.creditType,
        },
      });
    }

    // 3. Record Attendance
    const adminEmail = (admin.email || '').trim().toLowerCase();
    const dbAdminList = await db
      .select()
      .from(users)
      .where(or(eq(users.id, admin.id), sql`LOWER(${users.email}) = ${adminEmail}`))
      .limit(1);
    const dbAdminId = dbAdminList.length > 0 ? dbAdminList[0].id : (admin.email || null);

    const attId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await db.insert(attendance).values({
      id: attId,
      registrationId: registration.id,
      day,
      session,
      status: 'present',
      timestamp: new Date(),
      markedBy: dbAdminId,
      method: 'qr_scan',
    });

    // 4. Audit Log
    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: 'ATTENDANCE_MARKED_QR',
      entity: 'attendance',
      entityId: attId,
      metadata: {
        registrationId: registration.registrationId,
        participantName: registration.name,
        day,
        session,
      },
    });

    // 5. Broadcast realtime event
    broadcastRealtimeEvent('attendance:updated', {
      registrationId: registration.registrationId,
      day,
      session,
      status: 'present',
    });

    return NextResponse.json({
      success: true,
      message: `✓ Attendance marked for ${registration.name} (Day ${day})`,
      participant: {
        name: registration.name,
        registrationId: registration.registrationId,
        department: registration.department,
        creditType: registration.creditType,
      },
    });
  } catch (error: any) {
    console.error('Attendance scan error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Attendance scan failed' },
      { status: 500 }
    );
  }
}
