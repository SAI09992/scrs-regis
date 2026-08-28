import { NextResponse } from 'next/server';
import { db } from '@/db';
import { eventSettings, payments } from '@/db/schema';
import { inArray } from 'drizzle-orm';
import { count } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Get capacity settings
    const settings = (await db.select().from(eventSettings).limit(1))[0];
    const totalCapacity = settings?.totalCapacity || 500;
    const registrationOpen = settings ? Boolean(settings.registrationOpen) : false;

    // 2. Get current confirmed or pending payments
    const totalPaymentsResult = await db
      .select({ count: count() })
      .from(payments)
      .where(inArray(payments.status, ['pending', 'verified']));

    const currentBooked = totalPaymentsResult[0].count;
    const remainingSpots = totalCapacity - currentBooked;
    const isSoldOut = remainingSpots <= 0 || !registrationOpen;

    return NextResponse.json({
      success: true,
      totalCapacity,
      currentBooked,
      remainingSpots: Math.max(0, remainingSpots),
      registrationOpen,
      isSoldOut,
    });
  } catch (err: any) {
    console.error('Failed to fetch capacity:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
