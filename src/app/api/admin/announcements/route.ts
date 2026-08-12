import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { announcements } from '@/db/schema';
import { announcementFormSchema } from '@/lib/validation';
import { requireAdmin } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';
import { broadcastRealtimeEvent } from '@/lib/realtime';
import { desc, eq } from 'drizzle-orm';

export async function GET() {
  try {
    const list = await db
      .select()
      .from(announcements)
      .orderBy(desc(announcements.createdAt));
    return NextResponse.json({ success: true, announcements: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const validated = announcementFormSchema.parse(body);

    const newId = `ann_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const [created] = await db
      .insert(announcements)
      .values({
        id: newId,
        title: validated.title,
        content: validated.content,
        priority: validated.priority,
        audience: validated.audience,
        published: validated.published,
        createdBy: admin.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: 'ANNOUNCEMENT_CREATED',
      entity: 'announcements',
      entityId: newId,
      metadata: { title: validated.title, priority: validated.priority },
    });

    broadcastRealtimeEvent('announcement:new', created);

    return NextResponse.json({ success: true, announcement: created });
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

    await db.delete(announcements).where(eq(announcements.id, id));

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: 'ANNOUNCEMENT_DELETED',
      entity: 'announcements',
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
