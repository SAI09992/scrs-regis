import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { registrations, payments, attendance, certificates } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';
import { broadcastRealtimeEvent } from '@/lib/realtime';
import { desc, eq, or, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();

    const list = await db
      .select({
        id: registrations.id,
        registrationId: registrations.registrationId,
        name: registrations.name,
        email: registrations.email,
        phone: registrations.phone,
        registerNumber: registrations.registerNumber,
        department: registrations.department,
        year: registrations.year,
        section: registrations.section,
        college: registrations.college,
        creditType: registrations.creditType,
        createdAt: registrations.createdAt,
        paymentStatus: payments.status,
        amount: payments.amount,
        utr: payments.utr,
      })
      .from(registrations)
      .leftJoin(payments, eq(registrations.id, payments.registrationId))
      .orderBy(desc(registrations.createdAt));

    return NextResponse.json({ success: true, registrations: list });
  } catch (err: any) {
    console.error('Registrations list error:', err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { searchParams } = new URL(req.url);
    const regId = searchParams.get('id') || searchParams.get('registrationId');

    if (!regId) {
      return NextResponse.json(
        { success: false, error: 'Registration ID is required.' },
        { status: 400 }
      );
    }

    // Locate registration
    const existing = await db
      .select()
      .from(registrations)
      .where(or(eq(registrations.id, regId), eq(registrations.registrationId, regId)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Registration record not found.' },
        { status: 404 }
      );
    }

    const reg = existing[0];

    // Cascade delete all associated dependencies
    await db.delete(attendance).where(eq(attendance.registrationId, reg.id));
    await db.delete(payments).where(eq(payments.registrationId, reg.id));
    await db.delete(certificates).where(eq(certificates.registrationId, reg.id));
    await db.delete(registrations).where(eq(registrations.id, reg.id));

    // Audit log deletion
    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: 'REGISTRATION_DELETED',
      entity: 'registration',
      entityId: reg.registrationId,
      metadata: {
        cadetName: reg.name,
        email: reg.email,
        registerNumber: reg.registerNumber,
      },
    });

    // Realtime broadcast of updated seat capacity
    const currentCounts = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(registrations)
      .where(eq(registrations.status, 'registered'));

    broadcastRealtimeEvent('registration:countUpdated', {
      totalRegistered: currentCounts[0]?.total || 0,
      totalCapacity: 200,
    });

    return NextResponse.json({
      success: true,
      message: `Registration ${reg.registrationId} (${reg.name}) has been deleted successfully.`,
    });
  } catch (err: any) {
    console.error('Delete registration error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to delete registration.' },
      { status: 500 }
    );
  }
}
