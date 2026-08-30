import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { teams, teamMembers, registrations, problemStatements, eventSettings } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, sql, or } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check if PS selection is enabled
    const settingsList = await db.select().from(eventSettings).limit(1);
    const settings = settingsList[0] || null;
    if (!(settings as any)?.psSelectionVisible) {
      return NextResponse.json({ success: false, error: 'Problem statement selection is not enabled yet' }, { status: 403 });
    }

    // Resolve user's registration
    const userEmail = (user.email || '').trim().toLowerCase();
    const regList = await db
      .select()
      .from(registrations)
      .where(
        or(
          eq(registrations.userId, user.id),
          userEmail ? sql`LOWER(${registrations.email}) = ${userEmail}` : undefined
        )
      )
      .limit(1);

    if (regList.length === 0) {
      return NextResponse.json({ success: false, error: 'Registration not found' }, { status: 404 });
    }

    const registration = regList[0];

    // Find team
    const membershipList = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.registrationId, registration.id))
      .limit(1);

    if (membershipList.length === 0) {
      return NextResponse.json({ success: false, error: 'You are not in a team' }, { status: 400 });
    }

    const teamList = await db
      .select()
      .from(teams)
      .where(eq(teams.id, membershipList[0].teamId))
      .limit(1);

    if (teamList.length === 0) {
      return NextResponse.json({ success: false, error: 'Team not found' }, { status: 404 });
    }

    const team = teamList[0];

    // Check if user is team lead
    if (team.teamLeadRegistrationId !== registration.id) {
      return NextResponse.json({ success: false, error: 'Only the team lead can roll the dice' }, { status: 403 });
    }

    // Check if PS already assigned
    if (team.problemStatementId) {
      return NextResponse.json({ success: false, error: 'Problem statement already assigned. No re-rolls allowed!' }, { status: 400 });
    }

    // Get all problem statements
    const allPS = await db.select().from(problemStatements);
    if (allPS.length === 0) {
      return NextResponse.json({ success: false, error: 'No problem statements available yet' }, { status: 400 });
    }

    // Count how many teams have each PS
    const allTeams = await db.select().from(teams);
    const psCounts: Record<string, number> = {};
    allTeams.forEach((t) => {
      if (t.problemStatementId) {
        psCounts[t.problemStatementId] = (psCounts[t.problemStatementId] || 0) + 1;
      }
    });

    // Filter to available PS (not yet at max)
    const available = allPS.filter((ps) => (psCounts[ps.id] || 0) < ps.maxTeams);

    if (available.length === 0) {
      return NextResponse.json({ success: false, error: 'All problem statements have reached maximum team capacity' }, { status: 400 });
    }

    // Random dice roll
    const rolledIndex = Math.floor(Math.random() * available.length);
    const assignedPS = available[rolledIndex];

    // Assign PS to team
    await db.update(teams).set({ problemStatementId: assignedPS.id }).where(eq(teams.id, team.id));

    return NextResponse.json({
      success: true,
      rolledNumber: assignedPS.slotNumber,
      problemStatement: assignedPS,
    });
  } catch (err: any) {
    console.error('Dice roll error:', err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
