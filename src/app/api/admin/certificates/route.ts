import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { certificates, registrations, payments, attendance } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
import { generateCertificateId } from '@/lib/utils';
import { logAdminAction } from '@/lib/audit';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();

    const list = await db
      .select({
        certificate: certificates,
        registration: registrations,
      })
      .from(certificates)
      .innerJoin(registrations, eq(certificates.registrationId, registrations.id))
      .orderBy(desc(certificates.issuedAt));

    return NextResponse.json({ success: true, certificates: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { registrationId } = await req.json();

    if (!registrationId) {
      return NextResponse.json({ success: false, error: 'Registration ID required' }, { status: 400 });
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

    // Check if certificate already exists
    const existing = await db
      .select()
      .from(certificates)
      .where(eq(certificates.registrationId, reg.id))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({
        success: true,
        certificate: existing[0],
        message: 'Certificate already issued for this cadet.',
      });
    }

    const certId = generateCertificateId();
    const newCert = {
      id: `cert_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      registrationId: reg.id,
      certificateId: certId,
      issuedAt: new Date(),
      verificationStatus: 'valid' as const,
      metadata: {
        participantName: reg.name,
        registerNumber: reg.registerNumber,
        department: reg.department,
        issuedByAdmin: admin.email,
      },
    };

    await db.insert(certificates).values(newCert);

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: 'CERTIFICATE_ISSUED',
      entity: 'certificates',
      entityId: certId,
      metadata: {
        registrationId: reg.registrationId,
        participantName: reg.name,
      },
    });

    return NextResponse.json({
      success: true,
      certificate: newCert,
      message: `✓ Certificate ${certId} successfully issued for ${reg.name}`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
