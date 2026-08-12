import { NextResponse } from 'next/server';
import { db } from '@/db';
import { registrations, payments, attendance, certificates } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Fetch Registration
    const regList = await db
      .select()
      .from(registrations)
      .where(eq(registrations.userId, user.id))
      .limit(1);

    if (regList.length === 0) {
      return NextResponse.json({
        success: true,
        registration: null,
        payment: null,
        attendance: [],
        certificate: null,
      });
    }

    const registration = regList[0];

    // 2. Fetch Payment
    const payList = await db
      .select()
      .from(payments)
      .where(eq(payments.registrationId, registration.id))
      .limit(1);

    const payment = payList[0] || null;

    // 3. Fetch Attendance
    const attList = await db
      .select()
      .from(attendance)
      .where(eq(attendance.registrationId, registration.id));

    // 4. Fetch Certificate
    const certList = await db
      .select()
      .from(certificates)
      .where(eq(certificates.registrationId, registration.id))
      .limit(1);

    const certificate = certList[0] || null;

    return NextResponse.json({
      success: true,
      registration,
      payment,
      attendance: attList,
      certificate,
    });
  } catch (error: any) {
    console.error('Portal me error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve portal data' },
      { status: 500 }
    );
  }
}
