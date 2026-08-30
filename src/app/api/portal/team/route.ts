import { NextResponse } from 'next/server';
import { db } from '@/db';
import { teams, teamMembers, registrations, problemStatements, eventSettings } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, sql, or } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get visibility settings
    const settingsList = await db.select().from(eventSettings).limit(1);
    const settings = settingsList[0] || null;
    const teamPortalVisible = (settings as any)?.teamPortalVisible ?? false;
    const psSelectionVisible = (settings as any)?.psSelectionVisible ?? false;

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
      return NextResponse.json({
        success: true,
        team: null,
        isTeamLead: false,
        teamPortalVisible,
        psSelectionVisible,
        unassigned: true,
      });
    }

    const registration = regList[0];

    // Find team membership
    const membershipList = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.registrationId, registration.id))
      .limit(1);

    if (membershipList.length === 0) {
      return NextResponse.json({
        success: true,
        team: null,
        isTeamLead: false,
        teamPortalVisible,
        psSelectionVisible,
        unassigned: true,
      });
    }

    const membership = membershipList[0];

    // Get team
    const teamList = await db
      .select()
      .from(teams)
      .where(eq(teams.id, membership.teamId))
      .limit(1);

    if (teamList.length === 0) {
      return NextResponse.json({
        success: true,
        team: null,
        isTeamLead: false,
        teamPortalVisible,
        psSelectionVisible,
        unassigned: true,
      });
    }

    const team = teamList[0];

    // Get all team members with registration details
    const members = await db
      .select({
        id: teamMembers.id,
        registrationId: teamMembers.registrationId,
        name: registrations.name,
        email: registrations.email,
        registerNumber: registrations.registerNumber,
        department: registrations.department,
        year: registrations.year,
        section: registrations.section,
      })
      .from(teamMembers)
      .leftJoin(registrations, eq(teamMembers.registrationId, registrations.id))
      .where(eq(teamMembers.teamId, team.id));

    // Get problem statement if assigned
    let ps = null;
    if (team.problemStatementId) {
      const psList = await db
        .select()
        .from(problemStatements)
        .where(eq(problemStatements.id, team.problemStatementId))
        .limit(1);
      ps = psList[0] || null;
    }

    const isTeamLead = team.teamLeadRegistrationId === registration.id;

    return NextResponse.json({
      success: true,
      team: {
        id: team.id,
        teamName: team.teamName,
        teamLeadRegistrationId: team.teamLeadRegistrationId,
        memberCount: members.length,
        members,
        problemStatement: ps,
      },
      isTeamLead,
      teamPortalVisible,
      psSelectionVisible,
      unassigned: false,
    });
  } catch (err: any) {
    console.error('Portal team error:', err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
