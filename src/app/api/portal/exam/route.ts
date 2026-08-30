import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { examSettings, examAttempts, examQuestions, registrations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const userRegs = await db.select().from(registrations).where(eq(registrations.email, session.user.email));
    if (userRegs.length === 0) return NextResponse.json({ success: false, error: 'No registration' }, { status: 400 });
    const reg = userRegs[0];

    // Check Exam Settings
    const settings = await db.select().from(examSettings).where(eq(examSettings.id, 'default')).limit(1);
    if (settings.length === 0 || !settings[0].examActive) {
      return NextResponse.json({ success: false, error: 'Exam is not active.' }, { status: 403 });
    }

    const { warningLimit, durationMinutes } = settings[0];

    // Get or Create Attempt
    let attempts = await db.select().from(examAttempts).where(eq(examAttempts.registrationId, reg.id)).limit(1);
    let attempt;

    if (attempts.length === 0) {
      const newAttemptId = `ea_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await db.insert(examAttempts).values({
        id: newAttemptId,
        registrationId: reg.id,
        status: 'in_progress',
        startedAt: new Date(),
      });
      attempts = await db.select().from(examAttempts).where(eq(examAttempts.id, newAttemptId));
    }
    attempt = attempts[0];

    if (attempt.status === 'completed' || attempt.status === 'terminated') {
      return NextResponse.json({ success: false, error: 'Exam already finished.' }, { status: 403 });
    }

    if (attempt.status === 'not_started') {
      await db.update(examAttempts).set({ status: 'in_progress', startedAt: new Date() }).where(eq(examAttempts.id, attempt.id));
      attempt.status = 'in_progress';
      attempt.startedAt = new Date();
    }

    // Fetch and Jumble Questions
    const rawQuestions = await db.select().from(examQuestions);
    
    // Jumble the questions array
    const jumbledQuestions = shuffleArray(rawQuestions).map(q => {
      // Jumble options
      const optionsList = Array.isArray(q.options) ? q.options : [];
      return {
        id: q.id,
        questionText: q.questionText,
        options: shuffleArray(optionsList),
      };
    });

    return NextResponse.json({
      success: true,
      attempt,
      questions: jumbledQuestions,
      warningLimit,
      durationMinutes,
      serverTime: Date.now()
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const userRegs = await db.select().from(registrations).where(eq(registrations.email, session.user.email));
    if (userRegs.length === 0) return NextResponse.json({ success: false, error: 'No registration' }, { status: 400 });
    const reg = userRegs[0];

    const attempts = await db.select().from(examAttempts).where(eq(examAttempts.registrationId, reg.id)).limit(1);
    if (attempts.length === 0) return NextResponse.json({ success: false, error: 'No attempt found' }, { status: 400 });
    const attempt = attempts[0];

    if (attempt.status === 'completed' || attempt.status === 'terminated') {
      return NextResponse.json({ success: false, error: 'Exam already finished.' }, { status: 403 });
    }

    const { action, payload } = await req.json();

    if (action === 'log_violation') {
      const settingsList = await db.select().from(examSettings).where(eq(examSettings.id, 'default')).limit(1);
      const limit = settingsList[0]?.warningLimit || 3;

      const newWarningsCount = attempt.warningsCount + 1;
      const logs: any[] = Array.isArray(attempt.violationLogs) ? attempt.violationLogs : [];
      logs.push({ time: new Date().toISOString(), reason: payload.reason });

      const updates: any = {
        warningsCount: newWarningsCount,
        violationLogs: logs,
      };

      let terminated = false;
      if (newWarningsCount > limit) {
        updates.status = 'terminated';
        updates.endedAt = new Date();
        terminated = true;
      }

      await db.update(examAttempts).set(updates).where(eq(examAttempts.id, attempt.id));
      return NextResponse.json({ success: true, terminated, newWarningsCount });
    }

    if (action === 'submit_answers' || action === 'auto_submit') {
      const userAnswers = payload.answers || {}; // { questionId: selectedText }
      
      // Calculate score
      const rawQuestions = await db.select().from(examQuestions);
      let score = 0;

      for (const q of rawQuestions) {
        const correctText = Array.isArray(q.options) ? q.options[q.correctOptionIndex] : null;
        if (userAnswers[q.id] === correctText) {
          score += 1;
        }
      }

      await db.update(examAttempts).set({
        answers: userAnswers,
        score,
        status: 'completed',
        endedAt: new Date()
      }).where(eq(examAttempts.id, attempt.id));

      return NextResponse.json({ success: true, score });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
