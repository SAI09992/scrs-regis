import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
import { logAdminAction } from '@/lib/audit';
import { eq, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET — List all coordinators (admins)
export async function GET() {
  try {
    await requireAdmin();

    const admins = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.role, 'admin'));

    return NextResponse.json({ success: true, coordinators: admins });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

// POST — Add a new coordinator by email
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists
    const existing = await db
      .select()
      .from(users)
      .where(sql`LOWER(${users.email}) = ${cleanEmail}`)
      .limit(1);

    if (existing.length === 0) {
      // Create a new user record with admin role — they'll be linked on first Google sign-in
      const newId = `usr_${Math.random().toString(36).substring(2, 10)}`;
      await db.insert(users).values({
        id: newId,
        email: cleanEmail,
        name: 'Coordinator (Pending Sign-in)',
        role: 'admin',
      });
    } else {
      // Update existing user to admin
      await db
        .update(users)
        .set({ role: 'admin' })
        .where(eq(users.id, existing[0].id));
    }

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: 'COORDINATOR_ADDED',
      entity: 'user',
      entityId: cleanEmail,
      metadata: { promotedBy: admin.email },
    });

    return NextResponse.json({
      success: true,
      message: `${cleanEmail} has been added as a coordinator.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

// DELETE — Remove coordinator (demote to participant)
export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email')?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
    }

    // Prevent self-demotion
    if (email === admin.email.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'You cannot remove yourself as coordinator.' },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    await db
      .update(users)
      .set({ role: 'participant' })
      .where(eq(users.email, email));

    await logAdminAction({
      adminId: admin.id,
      adminEmail: admin.email,
      action: 'COORDINATOR_REMOVED',
      entity: 'user',
      entityId: email,
      metadata: { demotedBy: admin.email },
    });

    return NextResponse.json({
      success: true,
      message: `${email} has been removed as coordinator.`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
