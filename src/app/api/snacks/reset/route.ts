import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { snacksDistribution } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { slot, resetAll = false } = body;

    if (resetAll) {
      await db.delete(snacksDistribution);

      await logAdminAction({
        adminId: admin.id,
        adminEmail: admin.email,
        action: 'SNACKS_RESET_ALL',
        entity: 'snacks',
        entityId: 'all_slots',
        metadata: { resetAll: true },
      });

      return NextResponse.json({
        success: true,
        message: '✓ All snacks distribution records across all 4 slots have been reset.',
      });
    }

    if (!slot) {
      return NextResponse.json({ success: false, error: 'Slot number is required' }, { status: 400 });
    }

    await db.delete(snacksDistribution).where(eq(snacksDistribution.slot, Number(slot)));

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: 'SNACKS_RESET_SLOT',
      entity: 'snacks',
      entityId: `slot_${slot}`,
      metadata: { slot: Number(slot) },
    });

    return NextResponse.json({
      success: true,
      message: `✓ Snacks distribution data for Slot ${slot} has been reset. All cadets are now eligible for snacks in this slot.`,
    });
  } catch (error: any) {
    console.error('Snacks reset error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to reset snacks data' },
      { status: 500 }
    );
  }
}
