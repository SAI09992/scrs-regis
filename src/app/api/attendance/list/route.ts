import { NextResponse } from 'next/server';
import { db } from '@/db';
import { registrations, payments, attendance } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
import { asc, desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();

    // 1. Get all registrations with payments
    const regList = await db
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
        paymentStatus: payments.status,
        createdAt: registrations.createdAt,
      })
      .from(registrations)
      .leftJoin(payments, eq(registrations.id, payments.registrationId))
      .orderBy(asc(registrations.name));

    // 2. Get all attendance records
    const attendanceRecords = await db.select().from(attendance);

    // 3. Map attendance to each cadet
    const attendanceMap: Record<string, { day1: boolean; day2: boolean }> = {};
    attendanceRecords.forEach((att) => {
      if (!attendanceMap[att.registrationId]) {
        attendanceMap[att.registrationId] = { day1: false, day2: false };
      }
      if (att.day === 1 && att.status === 'present') {
        attendanceMap[att.registrationId].day1 = true;
      }
      if (att.day === 2 && att.status === 'present') {
        attendanceMap[att.registrationId].day2 = true;
      }
    });

    const combinedList = regList.map((r) => ({
      ...r,
      day1Present: attendanceMap[r.id]?.day1 || false,
      day2Present: attendanceMap[r.id]?.day2 || false,
    }));

    const day1Total = combinedList.filter((c) => c.day1Present).length;
    const day2Total = combinedList.filter((c) => c.day2Present).length;

    return NextResponse.json({
      success: true,
      cadets: combinedList,
      stats: {
        totalCadets: combinedList.length,
        day1Total,
        day2Total,
      },
    });
  } catch (error: any) {
    console.error('Attendance list error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch attendance roster' },
      { status: 500 }
    );
  }
}
