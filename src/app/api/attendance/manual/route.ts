import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { attendance, registrations } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';
import { broadcastRealtimeEvent } from '@/lib/realtime';
import { and, eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { registrationId, day, session, status } = await req.json();

    if (!registrationId || !day) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    const regList = await db
      .select()
      .from(registrations)
      .where(eq(registrations.registrationId, registrationId.trim().toUpperCase()))
      .limit(1);

    if (regList.length === 0) {
      return NextResponse.json({ success: false, error: 'Registration not found' }, { status: 404 });
    }

    const reg = regList[0];

    // Check if record exists
    const existing = await db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.registrationId, reg.id),
          eq(attendance.day, Number(day)),
          eq(attendance.session, session || 'morning')
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(attendance)
        .set({
          status: status || 'present',
          markedBy: admin.id,
          timestamp: new Date(),
          method: 'manual_override',
        })
        .where(eq(attendance.id, existing[0].id));
    } else {
      await db.insert(attendance).values({
        id: `att_man_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        registrationId: reg.id,
        day: Number(day),
        session: session || 'morning',
        status: status || 'present',
        timestamp: new Date(),
        markedBy: admin.id,
        method: 'manual_override',
      });
    }

    // Audit Log
    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: 'ATTENDANCE_MANUAL_OVERRIDE',
      entity: 'attendance',
      entityId: reg.registrationId,
      metadata: {
        participantName: reg.name,
        day: Number(day),
        status: status || 'present',
      },
    });

    broadcastRealtimeEvent('attendance:updated', {
      registrationId: reg.registrationId,
      day: Number(day),
      status: status || 'present',
    });

    return NextResponse.json({ success: true, message: 'Attendance updated successfully' });
  } catch (error: any) {
    console.error('Manual attendance error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Update failed' }, { status: 500 });
  }
}
