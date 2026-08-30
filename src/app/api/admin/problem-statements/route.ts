import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { problemStatements } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
import { eq, asc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET — List all problem statements
export async function GET() {
  try {
    await requireAdmin();
    const ps = await db.select().from(problemStatements).orderBy(asc(problemStatements.slotNumber));
    return NextResponse.json({ success: true, problemStatements: ps });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

// POST — Create or update PS
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { id, slotNumber, title, documentUrl, maxTeams } = await req.json();

    if (!slotNumber || !title) {
      return NextResponse.json({ success: false, error: 'slotNumber and title required' }, { status: 400 });
    }

    if (id) {
      // Update existing
      await db.update(problemStatements).set({
        slotNumber,
        title,
        documentUrl: documentUrl || null,
        maxTeams: maxTeams || 7,
      }).where(eq(problemStatements.id, id));
    } else {
      // Create new
      const psId = `ps_${slotNumber}`;
      await db.insert(problemStatements).values({
        id: psId,
        slotNumber,
        title,
        documentUrl: documentUrl || null,
        maxTeams: maxTeams || 7,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

// DELETE — Delete PS
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const psId = searchParams.get('id');

    if (!psId) {
      return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
    }

    await db.delete(problemStatements).where(eq(problemStatements.id, psId));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
