import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { schedules } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';
import { asc, eq } from 'drizzle-orm';

export async function GET() {
  try {
    const list = await db.select().from(schedules).orderBy(asc(schedules.day), asc(schedules.orderIndex));
    return NextResponse.json({ success: true, schedules: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const newId = `sch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const [created] = await db
      .insert(schedules)
      .values({
        id: newId,
        day: Number(body.day),
        startTime: body.startTime,
        endTime: body.endTime,
        title: body.title,
        description: body.description,
        speaker: body.speaker,
        orderIndex: Number(body.orderIndex || 0),
      })
      .returning();

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: 'SCHEDULE_ITEM_CREATED',
      entity: 'schedules',
      entityId: newId,
      metadata: body,
    });

    return NextResponse.json({ success: true, item: created });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

    await db.delete(schedules).where(eq(schedules.id, id));

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: 'SCHEDULE_ITEM_DELETED',
      entity: 'schedules',
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
