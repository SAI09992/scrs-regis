import { NextResponse } from 'next/server';
import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();

    const list = await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.timestamp))
      .limit(100);

    return NextResponse.json({ success: true, logs: list });
  } catch (err: any) {
    console.error('Audit logs error:', err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
