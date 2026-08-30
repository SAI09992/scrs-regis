const { neon } = require('@neondatabase/serverless');

async function main() {
  const sql = neon(process.env.DATABASE_URL);

  console.log('=== STEP 1: Create tables ===');

  // Add visibility columns to event_settings
  await sql`ALTER TABLE event_settings ADD COLUMN IF NOT EXISTS team_portal_visible BOOLEAN NOT NULL DEFAULT false`;
  await sql`ALTER TABLE event_settings ADD COLUMN IF NOT EXISTS ps_selection_visible BOOLEAN NOT NULL DEFAULT false`;

  // Create teams table
  await sql`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      team_name TEXT NOT NULL DEFAULT '',
      team_lead_registration_id TEXT,
      problem_statement_id TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  // Create team_members table
  await sql`
    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      registration_id TEXT NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
      joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE(registration_id)
    )
  `;

  // Create problem_statements table
  await sql`
    CREATE TABLE IF NOT EXISTS problem_statements (
      id TEXT PRIMARY KEY,
      slot_number INTEGER NOT NULL UNIQUE,
      title TEXT NOT NULL,
      document_url TEXT,
      max_teams INTEGER NOT NULL DEFAULT 7,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  // Create indexes
  await sql`CREATE INDEX IF NOT EXISTS teams_name_idx ON teams(team_name)`;
  await sql`CREATE INDEX IF NOT EXISTS team_members_team_id_idx ON team_members(team_id)`;

  console.log('Tables and columns created successfully!');

  // ============================================================
  // STEP 2: Seed the 20 teams
  // ============================================================
  console.log('\n=== STEP 2: Seed teams ===');

  const teamsData = [
    {
      name: '',
      members: ['99230040869', '99230040912', '9923005013', '9923005049', '9923005042'],
    },
    {
      name: 'SUPREME CODERS',
      members: ['99240040066', '99240040927', '99240040925', '99240041305', '99230040113'],
    },
    {
      name: 'Akatsuki',
      members: ['99230040853', '99230040190', '99240041279', '99230040495', '99230040884'],
    },
    {
      name: 'Hawkins',
      members: ['99230040634', '99230040642', '99240040732', '99230040630', '99230040587'],
    },
    {
      name: "Raiser's",
      members: ['99230040225', '99230040680', '99230040235', '99230040632', '9824020001'],
    },
    {
      name: 'Future minds',
      members: ['99230040593', '99230040868', '99230040883', '99230040877', '99230040189'],
    },
    {
      name: 'CYPHER',
      members: ['99230040748', '99230040908', '99230040865', '99230040613', '99230041254'],
    },
    {
      name: 'Sentrix',
      members: ['99230041106', '99230041099', '9923005246', '99230041138', '9924020004'],
    },
    {
      name: 'Dracarys',
      members: ['99230040436', '99230040245', '99230040203', '99230040059', '99230040199'],
    },
    {
      name: 'Tech squad',
      members: ['99240041281', '99240041245', '9924008109', '9923008107', '99230041143'],
    },
    {
      name: 'Squad 110',
      members: ['99230041165', '99230040373', '99230040429', '9923008034', '9923008044'],
    },
    {
      name: 'hackers',
      members: ['99240040556', '99240040742', '99240040729', '99240041138', '99250040771'],
    },
    {
      name: 'AK47',
      members: ['9924005339', '9924005396', '9924005089', '9924005284', '9924005429'],
    },
    {
      name: 'cybersentinels',
      members: ['99230040963', '9923020006', '99230041212', '99230041237', '99230041207'],
    },
    {
      name: 'FAIRLY TAIL',
      members: ['9924005042', '9924005416', '9924005289', '9924005185', '9924009035'],
    },
    {
      name: 'Red team',
      members: ['99250040284', '99250040760', '99230040566'],
    },
    {
      name: 'Guns and Roses',
      members: ['99230040220', '99230040407', '99230040221', '99230040345', '99230040309', '99230040697'],
    },
    {
      name: 'Classmates',
      members: ['9923005110', '9923005139', '9923005132', '9824005015'],
    },
    {
      name: 'Straw Hats',
      members: ['99250040323', '99250040701', '99250040075', '99250040531', '99250040700'],
    },
    {
      name: 'Brad pitt',
      members: ['99240040969', '99240040180', '99240040959'],
    },
  ];

  // Clear existing team data
  await sql`DELETE FROM team_members`;
  await sql`DELETE FROM teams`;

  let totalMembersAdded = 0;
  let teamsCreated = 0;
  const missingRegNumbers = [];

  for (let i = 0; i < teamsData.length; i++) {
    const team = teamsData[i];
    const teamId = `team_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Resolve member registration IDs from register_number or email prefix
    const resolvedMembers = [];
    for (const regNum of team.members) {
      const rows = await sql`
        SELECT id, name, register_number, email
        FROM registrations
        WHERE register_number = ${regNum}
           OR SPLIT_PART(email, '@', 1) = ${regNum}
        LIMIT 1
      `;
      if (rows.length > 0) {
        resolvedMembers.push(rows[0]);
      } else {
        missingRegNumbers.push(regNum);
        console.warn(`  ⚠ Registration not found for: ${regNum}`);
      }
    }

    if (resolvedMembers.length === 0) {
      console.warn(`  ⚠ Team "${team.name}" has no valid members, skipping...`);
      continue;
    }

    // First resolved member = team lead
    const leadId = resolvedMembers[0].id;

    await sql`
      INSERT INTO teams (id, team_name, team_lead_registration_id)
      VALUES (${teamId}, ${team.name}, ${leadId})
    `;

    for (const member of resolvedMembers) {
      const memberId = `tm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      try {
        await sql`
          INSERT INTO team_members (id, team_id, registration_id)
          VALUES (${memberId}, ${teamId}, ${member.id})
        `;
        totalMembersAdded++;
      } catch (e) {
        console.warn(`  ⚠ Could not add ${member.name} (${member.register_number}): ${e.message}`);
      }
    }

    teamsCreated++;
    console.log(`  ✓ Team "${team.name || '(unnamed)'}" created with ${resolvedMembers.length} members (lead: ${resolvedMembers[0].name})`);
  }

  console.log(`\n=== DONE ===`);
  console.log(`Teams created: ${teamsCreated}`);
  console.log(`Total members added: ${totalMembersAdded}`);
  if (missingRegNumbers.length > 0) {
    console.log(`Missing registrations: ${missingRegNumbers.join(', ')}`);
  }
}

main().catch(console.error);
