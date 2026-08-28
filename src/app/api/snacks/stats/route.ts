import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { snacksDistribution, registrations, payments } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
import { desc, eq, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const slot = Number(searchParams.get('slot') || 1);

    // 1. Count served in this slot
    const slotCounts = await db
      .select({
        servedCount: sql<number>`count(*)::int`,
      })
      .from(snacksDistribution)
      .where(eq(snacksDistribution.slot, slot));

    // 2. Count total registered & verified participants
    const totalVerifiedResult = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(registrations)
      .leftJoin(payments, eq(registrations.id, payments.registrationId))
      .where(eq(payments.status, 'verified'));

    // 3. Counts across all 4 slots
    const allSlotCounts = await db
      .select({
        slot: snacksDistribution.slot,
        count: sql<number>`count(*)::int`,
      })
      .from(snacksDistribution)
      .groupBy(snacksDistribution.slot);

    const slotSummary: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    allSlotCounts.forEach((r) => {
      slotSummary[r.slot] = r.count;
    });

    // 4. Recent scans for this slot
    const recentScans = await db
      .select({
        id: snacksDistribution.id,
        slot: snacksDistribution.slot,
        distributedAt: snacksDistribution.distributedAt,
        registrationId: registrations.registrationId,
        name: registrations.name,
        registerNumber: registrations.registerNumber,
        department: registrations.department,
        section: registrations.section,
        creditType: registrations.creditType,
      })
      .from(snacksDistribution)
      .innerJoin(registrations, eq(snacksDistribution.registrationId, registrations.id))
      .where(eq(snacksDistribution.slot, slot))
      .orderBy(desc(snacksDistribution.distributedAt))
      .limit(50);

    return NextResponse.json({
      success: true,
      slot,
      servedCount: slotCounts[0]?.servedCount || 0,
      totalVerified: totalVerifiedResult[0]?.count || 0,
      slotSummary,
      recentScans,
    });
  } catch (error: any) {
    console.error('Snacks stats error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch snacks stats' },
      { status: 500 }
    );
  }
}
