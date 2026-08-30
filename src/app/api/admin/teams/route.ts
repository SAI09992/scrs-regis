import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { teams, teamMembers, registrations, problemStatements } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
import { eq, sql, asc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET — List all teams with members
export async function GET() {
  try {
    await requireAdmin();

    const allTeams = await db.select().from(teams).orderBy(asc(teams.teamName));

    const allMembers = await db
      .select({
        tmId: teamMembers.id,
        teamId: teamMembers.teamId,
        registrationId: teamMembers.registrationId,
        regInternalId: registrations.id,
        regDisplayId: registrations.registrationId,
        name: registrations.name,
        email: registrations.email,
        registerNumber: registrations.registerNumber,
        department: registrations.department,
        year: registrations.year,
        section: registrations.section,
      })
      .from(teamMembers)
      .leftJoin(registrations, eq(teamMembers.registrationId, registrations.id));

    const allPS = await db.select().from(problemStatements);

    const psMap: Record<string, any> = {};
    allPS.forEach((ps) => { psMap[ps.id] = ps; });

    const teamsWithMembers = allTeams.map((t) => ({
      ...t,
      members: allMembers.filter((m) => m.teamId === t.id),
      problemStatement: t.problemStatementId ? psMap[t.problemStatementId] || null : null,
    }));

    return NextResponse.json({ success: true, teams: teamsWithMembers });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

// POST — Create a team
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { teamName, leadRegistrationNumber, memberRegistrationNumbers } = await req.json();

    const teamId = `team_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Resolve lead
    let leadRegId: string | null = null;
    if (leadRegistrationNumber) {
      const leadRows = await db
        .select()
        .from(registrations)
        .where(
          sql`${registrations.registerNumber} = ${leadRegistrationNumber} OR SPLIT_PART(${registrations.email}, '@', 1) = ${leadRegistrationNumber}`
        )
        .limit(1);
      if (leadRows.length > 0) leadRegId = leadRows[0].id;
    }

    await db.insert(teams).values({
      id: teamId,
      teamName: teamName || '',
      teamLeadRegistrationId: leadRegId,
    });

    // Add members
    const memberNums: string[] = memberRegistrationNumbers || [];
    for (const num of memberNums) {
      const rows = await db
        .select()
        .from(registrations)
        .where(
          sql`${registrations.registerNumber} = ${num} OR SPLIT_PART(${registrations.email}, '@', 1) = ${num}`
        )
        .limit(1);
      if (rows.length > 0) {
        const memberId = `tm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        try {
          await db.insert(teamMembers).values({
            id: memberId,
            teamId,
            registrationId: rows[0].id,
          });
        } catch (e) {
          // member may already be in another team
        }
      }
    }

    return NextResponse.json({ success: true, teamId });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

// PUT — Update team name or lead
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const { teamId, teamName, teamLeadRegistrationId } = await req.json();

    if (!teamId) {
      return NextResponse.json({ success: false, error: 'teamId required' }, { status: 400 });
    }

    const updates: any = {};
    if (teamName !== undefined) updates.teamName = teamName;
    if (teamLeadRegistrationId !== undefined) updates.teamLeadRegistrationId = teamLeadRegistrationId;

    if (Object.keys(updates).length > 0) {
      await db.update(teams).set(updates).where(eq(teams.id, teamId));
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

// DELETE — Delete team
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json({ success: false, error: 'teamId required' }, { status: 400 });
    }

    await db.delete(teamMembers).where(eq(teamMembers.teamId, teamId));
    await db.delete(teams).where(eq(teams.id, teamId));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
