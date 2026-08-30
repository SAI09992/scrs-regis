import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/db';
import { examSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    await requireAdmin();
    let settings = await db.select().from(examSettings).where(eq(examSettings.id, 'default')).limit(1);
    if (settings.length === 0) {
      await db.insert(examSettings).values({ id: 'default' });
      settings = await db.select().from(examSettings).where(eq(examSettings.id, 'default')).limit(1);
    }
    return NextResponse.json({ success: true, settings: settings[0] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { warningLimit, durationMinutes, examActive } = body;
    
    await db.update(examSettings).set({
      warningLimit,
      durationMinutes,
      examActive,
      updatedAt: new Date()
    }).where(eq(examSettings.id, 'default'));
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
