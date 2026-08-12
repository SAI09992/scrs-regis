import { NextResponse } from 'next/server';
import { db } from '@/db';
import { registrations, payments } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
import { eq, sql, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();

    // 1. Department breakdown (real data from registrations table)
    const deptBreakdown = await db
      .select({
        name: registrations.department,
        count: sql<number>`count(*)::int`,
      })
      .from(registrations)
      .where(eq(registrations.status, 'registered'))
      .groupBy(registrations.department)
      .orderBy(desc(sql`count(*)`));

    // 2. Credit track breakdown
    const trackBreakdown = await db
      .select({
        name: registrations.creditType,
        count: sql<number>`count(*)::int`,
      })
      .from(registrations)
      .where(eq(registrations.status, 'registered'))
      .groupBy(registrations.creditType);

    // 3. Year breakdown
    const yearBreakdown = await db
      .select({
        name: registrations.year,
        count: sql<number>`count(*)::int`,
      })
      .from(registrations)
      .where(eq(registrations.status, 'registered'))
      .groupBy(registrations.year)
      .orderBy(registrations.year);

    // 4. Payment status breakdown
    const paymentBreakdown = await db
      .select({
        name: payments.status,
        count: sql<number>`count(*)::int`,
      })
      .from(payments)
      .groupBy(payments.status);

    // 5. Registration velocity — registrations grouped by date
    const velocityData = await db
      .select({
        date: sql<string>`to_char(${registrations.createdAt}, 'YYYY-MM-DD')`,
        count: sql<number>`count(*)::int`,
      })
      .from(registrations)
      .where(eq(registrations.status, 'registered'))
      .groupBy(sql`to_char(${registrations.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${registrations.createdAt}, 'YYYY-MM-DD')`);

    // Build cumulative velocity
    let cumulative = 0;
    const cumulativeVelocity = velocityData.map((v) => {
      cumulative += v.count;
      return { date: v.date, registrations: cumulative, daily: v.count };
    });

    return NextResponse.json({
      success: true,
      analytics: {
        departmentBreakdown: deptBreakdown,
        trackBreakdown: trackBreakdown.map((t) => ({
          name: t.name === 'UE_CSE' ? 'PE — CSE' : 'UE — Other',
          count: t.count,
        })),
        yearBreakdown: yearBreakdown,
        paymentBreakdown: paymentBreakdown.map((p) => ({
          name: (p.name || 'unknown').charAt(0).toUpperCase() + (p.name || 'unknown').slice(1),
          count: p.count,
        })),
        registrationVelocity: cumulativeVelocity,
      },
    });
  } catch (err: any) {
    console.error('Analytics error:', err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
