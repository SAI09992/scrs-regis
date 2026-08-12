import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { payments, registrations } from '@/db/schema';
import { adminPaymentDecisionSchema } from '@/lib/validation';
import { requireAdmin } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';
import { broadcastRealtimeEvent } from '@/lib/realtime';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();

    const body = await req.json();
    const { paymentId, decision, rejectionReason } = adminPaymentDecisionSchema.parse(body);

    // 1. Fetch Payment & Registration
    const paymentRecords = await db
      .select({
        payment: payments,
        registration: registrations,
      })
      .from(payments)
      .innerJoin(registrations, eq(payments.registrationId, registrations.id))
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (paymentRecords.length === 0) {
      return NextResponse.json({ success: false, error: 'Payment record not found' }, { status: 404 });
    }

    const { payment, registration } = paymentRecords[0];

    // 2. Update Payment State
    const now = new Date();
    await db
      .update(payments)
      .set({
        status: decision,
        rejectionReason: decision === 'rejected' ? rejectionReason || 'Payment details could not be verified' : null,
        verifiedBy: admin.id,
        verifiedAt: now,
      })
      .where(eq(payments.id, paymentId));

    // 3. Write Audit Log
    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: decision === 'verified' ? 'PAYMENT_VERIFIED' : decision === 'rejected' ? 'PAYMENT_REJECTED' : 'PAYMENT_FLAGGED',
      entity: 'payments',
      entityId: paymentId,
      metadata: {
        registrationId: registration.registrationId,
        participantName: registration.name,
        utr: payment.utr,
        amount: payment.amount,
        decision,
        rejectionReason,
      },
    });

    // 4. Emit Realtime Event for instant Participant Portal update
    broadcastRealtimeEvent('payment:statusUpdated', {
      paymentId,
      registrationId: registration.registrationId,
      userId: payment.userId,
      status: decision,
      rejectionReason: decision === 'rejected' ? rejectionReason : undefined,
      verifiedAt: now.toISOString(),
    });

    return NextResponse.json({
      success: true,
      decision,
      paymentId,
      registrationId: registration.registrationId,
    });
  } catch (error: any) {
    console.error('Admin payment decision error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update payment status' },
      { status: error?.message === 'UNAUTHORIZED_ADMIN_REQUIRED' ? 403 : 500 }
    );
  }
}
