import { NextResponse } from 'next/server';
import { db } from '@/db';
import { payments, registrations } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();

    const list = await db
      .select({
        payment: payments,
        registration: registrations,
      })
      .from(payments)
      .innerJoin(registrations, eq(payments.registrationId, registrations.id))
      .orderBy(desc(payments.submittedAt));

    const formatted = list.map((item) => ({
      id: item.payment.id,
      registrationId: item.payment.registrationId,
      userId: item.payment.userId,
      utr: item.payment.utr,
      amount: item.payment.amount,
      expectedAmount: item.payment.expectedAmount,
      screenshotUrl: item.payment.screenshotUrl,
      ocrUtr: item.payment.ocrUtr,
      ocrAmount: item.payment.ocrAmount,
      ocrDate: item.payment.ocrDate,
      ocrConfidence: item.payment.ocrConfidence,
      status: item.payment.status,
      rejectionReason: item.payment.rejectionReason,
      submittedAt: item.payment.submittedAt,
      participant: {
        registrationId: item.registration.registrationId,
        name: item.registration.name,
        email: item.registration.email,
        phone: item.registration.phone,
        registerNumber: item.registration.registerNumber,
        department: item.registration.department,
        creditType: item.registration.creditType,
      },
    }));

    return NextResponse.json({ success: true, payments: formatted });
  } catch (err: any) {
    console.error('Payments list error:', err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
