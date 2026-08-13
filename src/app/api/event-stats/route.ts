import { NextResponse } from 'next/server';
import { db } from '@/db';
import { registrations, payments, attendance, eventSettings } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

let cachedStats: any = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 1500; // 1.5 second high-throughput memory cache

export async function GET() {
  const now = Date.now();
  if (cachedStats && now - lastFetchTime < CACHE_TTL_MS) {
    return NextResponse.json({ success: true, stats: cachedStats }, {
      headers: {
        'Cache-Control': 'public, s-maxage=2, stale-while-revalidate=5',
        'X-Cache': 'HIT',
      },
    });
  }

  try {
    // 1. Get Event Settings
    const settings = (await db.select().from(eventSettings).limit(1))[0] || {
      totalCapacity: 200,
      registrationOpen: true,
      registrationFee: 300,
      countdownTarget: '2026-08-29T09:00:00+05:30',
    };

    // 2. Count Active Registrations
    const regCounts = await db
      .select({
        total: sql<number>`count(*)::int`,
      })
      .from(registrations)
      .where(eq(registrations.status, 'registered'));

    // 3. Count Verified Payments
    const payCounts = await db
      .select({
        verified: sql<number>`count(case when ${payments.status} = 'verified' then 1 end)::int`,
        pending: sql<number>`count(case when ${payments.status} = 'pending' then 1 end)::int`,
      })
      .from(payments);

    // 4. Count Attendance
    const attCounts = await db
      .select({
        day1: sql<number>`count(case when ${attendance.day} = 1 and ${attendance.status} = 'present' then 1 end)::int`,
        day2: sql<number>`count(case when ${attendance.day} = 2 and ${attendance.status} = 'present' then 1 end)::int`,
      })
      .from(attendance);

    const counts = regCounts[0] || { total: 0 };
    const payStats = payCounts[0] || { verified: 0, pending: 0 };
    const attStats = attCounts[0] || { day1: 0, day2: 0 };

const DEFAULT_COORDINATORS = [
  {
    name: 'SAI DHANUSH',
    role: 'Student Technical Lead',
    department: 'CSE / 3rd Year',
    phone: '+91 93812 76836',
    whatsappUrl: 'https://wa.me/919381276836?text=Hi%20Sai%20Dhanush,%20I%20have%20a%20query%20about%20NextGen%20SOC%20Bootcamp.',
    callUrl: 'tel:+919381276836',
  },
  {
    name: 'RAHUL',
    role: 'Student Operations Lead',
    department: 'CSE / 3rd Year',
    phone: '+91 95153 92839',
    whatsappUrl: 'https://wa.me/919515392839?text=Hi%20Rahul,%20I%20have%20a%20query%20about%20NextGen%20SOC%20Bootcamp.',
    callUrl: 'tel:+919515392839',
  },
];

    const computedStats = {
      totalRegistered: counts.total,
      totalCapacity: (settings as any).totalCapacity || 200,
      paymentsVerified: payStats.verified,
      paymentsPending: payStats.pending,
      day1Attendance: attStats.day1,
      day2Attendance: attStats.day2,
      registrationOpen: (settings as any).registrationOpen && counts.total < ((settings as any).totalCapacity || 200),
      registrationFee: (settings as any).registrationFee || (settings as any).registrationFeeUe || 300,
      countdownTarget: (settings as any).countdownTarget || '2026-08-29T09:00:00+05:30',
      paymentUpiId: (settings as any).paymentUpiId || 'scrs@upi',
      paymentQrUrl: (settings as any).paymentQrUrl || null,
      coordinators: (settings as any).coordinators || DEFAULT_COORDINATORS,
      whatsappGroupLink: (settings as any).whatsappGroupLink || null,
      whatsappGroupQrUrl: (settings as any).whatsappGroupQrUrl || null,
    };

    cachedStats = computedStats;
    lastFetchTime = Date.now();

    return NextResponse.json({
      success: true,
      stats: computedStats,
    });
  } catch (error: any) {
    console.error('Error fetching event stats:', error);
    return NextResponse.json(
      {
        success: false,
        stats: {
          totalRegistered: 0,
          totalCapacity: 200,
          paymentsVerified: 0,
          paymentsPending: 0,
          day1Attendance: 0,
          day2Attendance: 0,
          registrationOpen: true,
          registrationFee: 300,
          countdownTarget: '2026-08-29T09:00:00+05:30',
        },
      },
      { status: 200 }
    );
  }
}
