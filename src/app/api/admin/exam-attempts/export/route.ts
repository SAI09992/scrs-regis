import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/db';
import { examAttempts, registrations, examQuestions } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    await requireAdmin();
    
    // Get total questions for scoring out of X
    const questions = await db.select({ id: examQuestions.id }).from(examQuestions);
    const totalQuestions = questions.length;

    // Fetch all registrations and left join attempts
    const allRegistrations = await db
      .select({
        registrationId: registrations.registrationId,
        name: registrations.name,
        email: registrations.email,
        phone: registrations.phone,
        attemptStatus: examAttempts.status,
        score: examAttempts.score,
        round2Score: examAttempts.round2Score,
        round3Score: examAttempts.round3Score,
        warningsCount: examAttempts.warningsCount,
        startedAt: examAttempts.startedAt,
        endedAt: examAttempts.endedAt,
      })
      .from(registrations)
      .leftJoin(examAttempts, eq(registrations.id, examAttempts.registrationId));

    // Convert to CSV
    const headers = [
      'Registration ID',
      'Name',
      'Email',
      'Phone',
      'Exam Status',
      'Round 1 Score (Quiz)',
      'Round 2 Score (Understanding)',
      'Round 3 Score',
      'Warnings',
      'Started At',
      'Ended At'
    ];

    const rows = allRegistrations.map(reg => {
      let status = 'Not Attempted';
      let scoreStr = 'Not Attempted';
      let r2Str = '-';
      let r3Str = '-';
      let warningsStr = '0';
      let startStr = '';
      let endStr = '';

      if (reg.attemptStatus) {
        status = reg.attemptStatus.toUpperCase().replace('_', ' ');
        scoreStr = reg.score !== null ? `${reg.score} / ${totalQuestions}` : 'In Progress / Terminated';
        r2Str = reg.round2Score !== null && reg.round2Score !== undefined ? reg.round2Score.toString() : '-';
        r3Str = reg.round3Score !== null && reg.round3Score !== undefined ? reg.round3Score.toString() : '-';
        warningsStr = reg.warningsCount?.toString() || '0';
        startStr = reg.startedAt ? new Date(reg.startedAt).toLocaleString() : '';
        endStr = reg.endedAt ? new Date(reg.endedAt).toLocaleString() : '';
      }

      return [
        `"${reg.registrationId || ''}"`,
        `"${reg.name || ''}"`,
        `"${reg.email || ''}"`,
        `"${reg.phone || ''}"`,
        `"${status}"`,
        `"${scoreStr}"`,
        `"${r2Str}"`,
        `"${r3Str}"`,
        `"${warningsStr}"`,
        `"${startStr}"`,
        `"${endStr}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="exam_results.csv"',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
