import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { registrations, eventSettings, termsAcceptances, users } from '@/db/schema';
import { fullRegistrationSchema } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { generateRegistrationId } from '@/lib/utils';
import { broadcastRealtimeEvent } from '@/lib/realtime';
import { eq, or, sql } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required to register.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = fullRegistrationSchema.parse(body);

    // 1. Ensure user exists in database and get their primary key ID
    const userEmail = (user.email || validatedData.email).trim().toLowerCase();
    let dbUserList = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);
    let dbUserId: string;

    if (dbUserList.length === 0) {
      dbUserId = `usr_${Math.random().toString(36).substring(2, 10)}`;
      await db.insert(users).values({
        id: dbUserId,
        email: userEmail,
        name: validatedData.name.trim() || user.name || 'Participant',
        role: 'participant',
      });
    } else {
      dbUserId = dbUserList[0].id;
    }

    // 2. Check if user has already registered (by userId or email)
    const existingUserReg = await db
      .select()
      .from(registrations)
      .where(
        or(
          eq(registrations.userId, dbUserId),
          eq(registrations.email, userEmail)
        )
      )
      .limit(1);

    if (existingUserReg.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'You have already registered for this bootcamp.',
          registrationId: existingUserReg[0].registrationId,
        },
        { status: 409 }
      );
    }

    // 3. Check if Register Number is already used
    const existingRegNum = await db
      .select()
      .from(registrations)
      .where(eq(registrations.registerNumber, validatedData.registerNumber.trim().toUpperCase()))
      .limit(1);

    if (existingRegNum.length > 0) {
      return NextResponse.json(
        { success: false, error: 'This Register Number is already registered.' },
        { status: 409 }
      );
    }

    // 4. Check Capacity — single pool of 200 total seats
    const settingsList = await db.select().from(eventSettings).limit(1);
    const settings = settingsList[0] || {
      totalCapacity: 200,
      registrationOpen: true,
    };

    if (!(settings as any).registrationOpen) {
      return NextResponse.json(
        { success: false, error: 'Registrations are currently closed by administrators.' },
        { status: 403 }
      );
    }

    // Count total registrations
    const currentCounts = await db
      .select({
        total: sql<number>`count(*)::int`,
      })
      .from(registrations)
      .where(eq(registrations.status, 'registered'));

    const counts = currentCounts[0] || { total: 0 };
    const totalCapacity = (settings as any).totalCapacity || 200;

    if (counts.total >= totalCapacity) {
      return NextResponse.json(
        { success: false, error: 'All 200 bootcamp seats have been filled.' },
        { status: 400 }
      );
    }

    // 5. Create Registration Record
    const regUniqueId = generateRegistrationId();
    const newRegRecord = {
      id: `reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      registrationId: regUniqueId,
      userId: dbUserId,
      name: validatedData.name.trim(),
      email: userEmail, // Locked to Google Email
      phone: validatedData.phone.trim(),
      registerNumber: validatedData.registerNumber.trim().toUpperCase(),
      department: validatedData.department,
      year: validatedData.year,
      section: validatedData.section.toUpperCase(),
      college: validatedData.college.trim(),
      creditType: validatedData.creditType,
      customFields: {
        priorExperience: validatedData.priorExperience || 'Beginner',
        preferredOperatingSystem: validatedData.preferredOperatingSystem || 'Windows',
        interests: validatedData.interests || [],
        dietaryOrAccessibility: validatedData.dietaryOrAccessibility || '',
      },
      status: 'registered' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(registrations).values(newRegRecord);

    // Record Terms Acceptance
    await db.insert(termsAcceptances).values({
      id: `ta_${Date.now()}`,
      userId: dbUserId,
      termsVersion: 'v1.0',
      acceptedAt: new Date(),
    });

    // 5. Broadcast updated seat count in real-time
    broadcastRealtimeEvent('registration:countUpdated', {
      totalRegistered: counts.total + 1,
      totalCapacity,
    });

    return NextResponse.json({
      success: true,
      registrationId: regUniqueId,
      data: newRegRecord,
    });
  } catch (error: any) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'We could not submit your registration right now. Please try again.',
      },
      { status: 500 }
    );
  }
}
