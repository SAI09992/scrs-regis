import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/db';
import { examQuestions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    await requireAdmin();
    const questions = await db.select().from(examQuestions).orderBy(examQuestions.orderIndex);
    return NextResponse.json({ success: true, questions });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { id, questionText, options, correctOptionIndex, orderIndex } = await req.json();

    if (id) {
      await db.update(examQuestions).set({
        questionText,
        options,
        correctOptionIndex,
        orderIndex
      }).where(eq(examQuestions.id, id));
    } else {
      const newId = `eq_${Date.now()}`;
      await db.insert(examQuestions).values({
        id: newId,
        questionText,
        options,
        correctOptionIndex,
        orderIndex
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });

    await db.delete(examQuestions).where(eq(examQuestions.id, id));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
