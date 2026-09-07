import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/db';
import { examAttempts, registrations } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    await requireAdmin();
    
    const data = await db
      .select({
        id: examAttempts.id,
        status: examAttempts.status,
        score: examAttempts.score,
        warningsCount: examAttempts.warningsCount,
        violationLogs: examAttempts.violationLogs,
        round2Score: examAttempts.round2Score,
        round3Score: examAttempts.round3Score,
        startedAt: examAttempts.startedAt,
        endedAt: examAttempts.endedAt,
        registrationId: registrations.registrationId,
        internalRegId: registrations.id,
        name: registrations.name,
        email: registrations.email,
        phone: registrations.phone
      })
      .from(registrations)
      .leftJoin(examAttempts, eq(registrations.id, examAttempts.registrationId))
      .orderBy(desc(registrations.createdAt));

    return NextResponse.json({ success: true, attempts: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { attemptId, action, round2Score, round3Score } = body;

    if (action === 'unblock') {
      await db.update(examAttempts).set({
        status: 'not_started',
        warningsCount: 0,
        startedAt: null,
        endedAt: null,
        score: null,
        answers: {}
      }).where(eq(examAttempts.id, attemptId));
      
      return NextResponse.json({ success: true, message: 'User unblocked and attempt reset.' });
    }

    if (action === 'update_marks') {
      const { internalRegId } = body;
      
      const r2 = round2Score === '' ? null : Number(round2Score);
      const r3 = round3Score === '' ? null : Number(round3Score);

      if (attemptId) {
        await db.update(examAttempts).set({
          round2Score: r2,
          round3Score: r3
        }).where(eq(examAttempts.id, attemptId));
      } else {
        // Create a dummy attempt row for this user just to store marks
        const { v4: uuidv4 } = require('uuid');
        await db.insert(examAttempts).values({
          id: uuidv4(),
          registrationId: internalRegId,
          status: 'not_started',
          round2Score: r2,
          round3Score: r3
        });
      }
      
      return NextResponse.json({ success: true, message: 'Marks updated successfully.' });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
