import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { registrations, payments, attendance } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'registrations';

    if (type === 'registrations') {
      const records = await db
        .select({
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
          paymentStatus: payments.status,
          utr: payments.utr,
          amount: payments.amount,
          createdAt: registrations.createdAt,
        })
        .from(registrations)
        .leftJoin(payments, eq(registrations.id, payments.registrationId));

      const headers = [
        'Registration ID',
        'Name',
        'Email',
        'Phone',
        'Register Number',
        'Department',
        'Year',
        'Section',
        'College',
        'Credit Type',
        'Payment Status',
        'UTR',
        'Amount (INR)',
        'Registered At',
      ];

      const csvRows = [headers.join(',')];

      for (const r of records) {
        csvRows.push(
          [
            `"${r.registrationId}"`,
            `"${r.name.replace(/"/g, '""')}"`,
            `"${r.email}"`,
            `"${r.phone}"`,
            `"${r.registerNumber}"`,
            `"${r.department}"`,
            `"${r.year}"`,
            `"${r.section}"`,
            `"${r.college.replace(/"/g, '""')}"`,
            `"${r.creditType}"`,
            `"${r.paymentStatus || 'unpaid'}"`,
            `"${r.utr || ''}"`,
            `"${r.amount || 0}"`,
            `"${new Date(r.createdAt).toISOString()}"`,
          ].join(',')
        );
      }

      return new Response(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="nextgen-soc-registrations-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid export type' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
