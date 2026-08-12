import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { eventSettings } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';
import { broadcastRealtimeEvent } from '@/lib/realtime';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const list = await db.select().from(eventSettings).limit(1);
    const settings = list[0] || null;
    return NextResponse.json({ success: true, settings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const existing = await db.select().from(eventSettings).limit(1);

    if (existing.length > 0) {
      await db
        .update(eventSettings)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(eq(eventSettings.id, existing[0].id));
    } else {
      await db.insert(eventSettings).values({
        id: 'settings_default',
        ...body,
        updatedAt: new Date(),
      });
    }

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: 'EVENT_SETTINGS_UPDATED',
      entity: 'event_settings',
      entityId: 'settings_default',
      metadata: body,
    });

    broadcastRealtimeEvent('event:statusChanged', body);

    return NextResponse.json({ success: true, message: 'Settings updated' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
