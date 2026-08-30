import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { teamMembers, registrations } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
import { eq, sql } from 'drizzle-orm';

// POST — Add member to team
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { teamId, registerNumber } = await req.json();

    if (!teamId || !registerNumber) {
      return NextResponse.json({ success: false, error: 'teamId and registerNumber required' }, { status: 400 });
    }

    const regRows = await db
      .select()
      .from(registrations)
      .where(
        sql`${registrations.registerNumber} = ${registerNumber.trim()} OR SPLIT_PART(${registrations.email}, '@', 1) = ${registerNumber.trim()}`
      )
      .limit(1);

    if (regRows.length === 0) {
      return NextResponse.json({ success: false, error: `Registration not found for: ${registerNumber}` }, { status: 404 });
    }

    // Check if already in a team
    const existing = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.registrationId, regRows[0].id))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: `${regRows[0].name} is already in another team` }, { status: 400 });
    }

    const memberId = `tm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await db.insert(teamMembers).values({
      id: memberId,
      teamId,
      registrationId: regRows[0].id,
    });

    return NextResponse.json({ success: true, member: { id: memberId, name: regRows[0].name } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

// DELETE — Remove member from team
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ success: false, error: 'memberId required' }, { status: 400 });
    }

    await db.delete(teamMembers).where(eq(teamMembers.id, memberId));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
