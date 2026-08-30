import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { examSettings, examAttempts, registrations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ success: false });

    // Get registration
    const userRegs = await db.select().from(registrations).where(eq(registrations.email, session.user.email));
    if (userRegs.length === 0) return NextResponse.json({ success: false });
    const reg = userRegs[0];

    // Get Settings
    const settings = await db.select().from(examSettings).where(eq(examSettings.id, 'default')).limit(1);
    const active = settings.length > 0 ? settings[0].examActive : false;
    
    // Get Attempts
    const attempts = await db.select().from(examAttempts).where(eq(examAttempts.registrationId, reg.id)).limit(1);
    const attempt = attempts.length > 0 ? attempts[0] : null;

    return NextResponse.json({ success: true, examActive: active, attempt });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
