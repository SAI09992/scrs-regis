import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { snacksDistribution, registrations, payments, users } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';
import { and, eq, or, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { registrationId, slot = 1, slotName = 'Snack Round 1' } = body;

    if (!registrationId) {
      return NextResponse.json({ success: false, error: 'Registration ID or Roll Number is required' }, { status: 400 });
    }

    let cleanId = registrationId.trim().toUpperCase();
    if (cleanId.startsWith('NGSOC-ATTENDANCE:')) {
      cleanId = cleanId.replace('NGSOC-ATTENDANCE:', '');
    }

    // 1. Locate registration by registrationId or registerNumber
    const regList = await db
      .select({
        registration: registrations,
        payment: payments,
      })
      .from(registrations)
      .leftJoin(payments, eq(registrations.id, payments.registrationId))
      .where(
        or(
          eq(registrations.registrationId, cleanId),
          eq(registrations.registerNumber, cleanId)
        )
      )
      .limit(1);

    if (regList.length === 0) {
      return NextResponse.json({ success: false, error: `No cadet found with ID or Roll Number: ${cleanId}` }, { status: 404 });
    }

    const { registration, payment } = regList[0];

    // Check if payment is verified
    const isPaymentVerified = payment?.status === 'verified';

    // 2. Check if already received snacks for this slot
    const existing = await db
      .select()
      .from(snacksDistribution)
      .where(
        and(
          eq(snacksDistribution.registrationId, registration.id),
          eq(snacksDistribution.slot, Number(slot))
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Already received snacks -> RE-ENTRY!
      return NextResponse.json({
        success: true,
        status: 'RE_ENTRY',
        message: 'RE-ENTRY // ALREADY RECEIVED SNACKS',
        participant: {
          id: registration.id,
          name: registration.name,
          registrationId: registration.registrationId,
          registerNumber: registration.registerNumber,
          department: registration.department,
          year: registration.year,
          section: registration.section,
          creditType: registration.creditType,
          paymentStatus: payment?.status || 'unpaid',
        },
        slot: Number(slot),
        slotName,
        firstGivenAt: existing[0].distributedAt,
      });
    }

    // 3. First time -> GIVE SNACKS!
    // Resolve admin DB user safely if exists
    const adminEmail = (admin.email || '').trim().toLowerCase();
    const dbAdminList = await db
      .select()
      .from(users)
      .where(or(eq(users.id, admin.id), sql`LOWER(${users.email}) = ${adminEmail}`))
      .limit(1);
    const dbAdminId = dbAdminList.length > 0 ? dbAdminList[0].id : (admin.email || null);

    const snackRecordId = `snk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await db.insert(snacksDistribution).values({
      id: snackRecordId,
      registrationId: registration.id,
      slot: Number(slot),
      slotName,
      distributedAt: new Date(),
      scannedBy: dbAdminId,
    });

    // 4. Audit Log
    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: 'SNACKS_DISTRIBUTED',
      entity: 'snacks',
      entityId: snackRecordId,
      metadata: {
        registrationId: registration.registrationId,
        participantName: registration.name,
        slot: Number(slot),
        slotName,
      },
    });

    return NextResponse.json({
      success: true,
      status: 'GIVE_SNACKS',
      message: 'GIVE SNACKS',
      participant: {
        id: registration.id,
        name: registration.name,
        registrationId: registration.registrationId,
        registerNumber: registration.registerNumber,
        department: registration.department,
        year: registration.year,
        section: registration.section,
        creditType: registration.creditType,
        paymentStatus: payment?.status || 'unpaid',
      },
      slot: Number(slot),
      slotName,
      distributedAt: new Date(),
      isPaymentVerified,
    });
  } catch (error: any) {
    console.error('Snacks scan error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Snacks scan process failed' },
      { status: 500 }
    );
  }
}
