import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { certificates, registrations, payments, attendance } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const certId = id.trim().toUpperCase();

    const certList = await db
      .select({
        certificate: certificates,
        registration: registrations,
        payment: payments,
      })
      .from(certificates)
      .innerJoin(registrations, eq(certificates.registrationId, registrations.id))
      .leftJoin(payments, eq(registrations.id, payments.registrationId))
      .where(eq(certificates.certificateId, certId))
      .limit(1);

    if (certList.length === 0) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: 'Certificate record not found in NEXTGEN SOC Cryptographic Registry.',
        },
        { status: 404 }
      );
    }

    const { certificate, registration } = certList[0];

    // Fetch attendance summary
    const attList = await db
      .select()
      .from(attendance)
      .where(eq(attendance.registrationId, registration.id));

    const day1Present = attList.some((a) => a.day === 1 && a.status === 'present');
    const day2Present = attList.some((a) => a.day === 2 && a.status === 'present');

    return NextResponse.json({
      success: true,
      valid: certificate.verificationStatus === 'valid',
      certificate: {
        certificateId: certificate.certificateId,
        issuedAt: certificate.issuedAt,
        status: certificate.verificationStatus,
        participantName: registration.name,
        registerNumber: registration.registerNumber,
        department: registration.department,
        college: registration.college,
        creditType: registration.creditType,
        attendance: {
          day1: day1Present,
          day2: day2Present,
        },
      },
    });
  } catch (error: any) {
    console.error('Certificate verification API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal verification service error' },
      { status: 500 }
    );
  }
}
