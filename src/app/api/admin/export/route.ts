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
          screenshotUrl: payments.screenshotUrl,
          createdAt: registrations.createdAt,
        })
        .from(registrations)
        .leftJoin(payments, eq(registrations.id, payments.registrationId));

      const excelData = records.map(r => {
        let screenshot = r.screenshotUrl || '';
        // Excel cells cannot exceed 32,767 characters. 
        // If an image was saved as a Base64 string instead of a Vercel Blob URL, it will crash the export.
        if (screenshot.length > 32000) {
          screenshot = '[Base64 Image Data - Too Large for Excel Export]';
        }

        return {
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
          'Screenshot Blob Link': screenshot
        };
      });

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

    if (type === 'absentees') {
      const dayParam = searchParams.get('day') || '1'; // '1', '2', or 'all'

      // Fetch all registered cadets
      const allCadets = await db
        .select({
          id: registrations.id,
          registrationId: registrations.registrationId,
          name: registrations.name,
          registerNumber: registrations.registerNumber,
          department: registrations.department,
          year: registrations.year,
          section: registrations.section,
          paymentStatus: payments.status,
        })
        .from(registrations)
        .leftJoin(payments, eq(registrations.id, payments.registrationId));

      // Fetch present attendance records
      const presentRecords = await db
        .select()
        .from(attendance)
        .where(eq(attendance.status, 'present'));

      const presentDay1Set = new Set<string>();
      const presentDay2Set = new Set<string>();

      presentRecords.forEach((att) => {
        if (att.day === 1) presentDay1Set.add(att.registrationId);
        if (att.day === 2) presentDay2Set.add(att.registrationId);
      });

      let absenteeRows: any[] = [];

      if (dayParam === '1') {
        absenteeRows = allCadets
          .filter((c) => !presentDay1Set.has(c.id))
          .map((c) => ({
            'Student Name': c.name,
            'Registration Number': c.registerNumber,
          }));
      } else if (dayParam === '2') {
        absenteeRows = allCadets
          .filter((c) => !presentDay2Set.has(c.id))
          .map((c) => ({
            'Student Name': c.name,
            'Registration Number': c.registerNumber,
          }));
      } else {
        absenteeRows = allCadets
          .filter((c) => !presentDay1Set.has(c.id) || !presentDay2Set.has(c.id))
          .map((c) => {
            const absentOn = [];
            if (!presentDay1Set.has(c.id)) absentOn.push('Day 1');
            if (!presentDay2Set.has(c.id)) absentOn.push('Day 2');
            return {
              'Student Name': c.name,
              'Registration Number': c.registerNumber,
              'Absent Days': absentOn.join(', '),
            };
          });
      }

      const worksheet = XLSX.utils.json_to_sheet(absenteeRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `Absentees_Day_${dayParam}`);

      const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      return new Response(buf, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="nextgen-soc-absentees-day${dayParam}-${Date.now()}.xlsx"`,
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid export type' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
