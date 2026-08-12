import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { registrations, payments, attendance } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
import { eq } from 'drizzle-orm';

import * as XLSX from 'xlsx';

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
          paymentScreenshotUrl: payments.paymentScreenshotUrl,
          createdAt: registrations.createdAt,
        })
        .from(registrations)
        .leftJoin(payments, eq(registrations.id, payments.registrationId));

      const excelData = records.map(r => ({
        'Registration ID': r.registrationId,
        'Name': r.name,
        'Email': r.email,
        'Phone': r.phone,
        'Register Number': r.registerNumber,
        'Department': r.department,
        'Year': r.year,
        'Section': r.section,
        'College': r.college,
        'Credit Type': r.creditType,
        'Payment Status': r.paymentStatus || 'unpaid',
        'UTR': r.utr || '',
        'Amount (INR)': r.amount || 0,
        'Registered At': new Date(r.createdAt).toLocaleString(),
        'Screenshot Blob Link': r.paymentScreenshotUrl || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

      // Write to buffer
      const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      return new Response(buf, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="nextgen-soc-registrations-${Date.now()}.xlsx"`,
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid export type' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
