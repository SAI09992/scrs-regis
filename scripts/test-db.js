// Quick DB health check script
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Manual .env loader
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.substring(0, eqIdx).trim();
        let val = trimmed.substring(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = val;
      }
    }
  });
}

async function testDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }

  console.log('🔗 Connecting to Neon PostgreSQL...');
  const sql = neon(connectionString);

  try {
    // 1. Test basic connection
    const pingResult = await sql`SELECT NOW() as current_time, current_database() as db_name`;
    console.log('✅ Database connection OK:', pingResult[0]);

    // 2. Check all expected tables exist
    const tables = await sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('\n📋 Tables in database:');
    tables.forEach((t) => console.log(`  ✅ ${t.table_name}`));

    const expectedTables = [
      'users', 'terms_acceptances', 'registrations', 'payments',
      'attendance', 'announcements', 'schedules', 'certificates',
      'audit_logs', 'event_settings'
    ];

    const existingNames = tables.map((t) => t.table_name);
    const missing = expectedTables.filter((t) => !existingNames.includes(t));
    if (missing.length > 0) {
      console.log('\n⚠️  Missing tables:', missing.join(', '));
    } else {
      console.log('\n✅ All 10 expected tables present!');
    }

    // 3. Count rows in each critical table
    console.log('\n📊 Row counts:');
    for (const table of expectedTables) {
      if (existingNames.includes(table)) {
        try {
          const count = await sql(`SELECT count(*)::int as cnt FROM "${table}"`);
          console.log(`  ${table}: ${count[0].cnt} rows`);
        } catch (e) {
          console.log(`  ${table}: ⚠️ count query failed`);
        }
      }
    }

    // 4. Test event_settings
    const settings = await sql`SELECT * FROM event_settings LIMIT 1`;
    if (settings.length > 0) {
      console.log('\n⚙️  Event Settings:');
      console.log(`  Total Capacity: ${settings[0].total_capacity}`);
      console.log(`  Registration Open: ${settings[0].registration_open}`);
      console.log(`  UPI ID: ${settings[0].payment_upi_id || 'not set'}`);
    } else {
      console.log('\n⚠️  No event_settings row found (will use defaults)');
    }

    console.log('\n🎉 All database checks passed!');
  } catch (err) {
    console.error('❌ Database test failed:', err.message);
    process.exit(1);
  }
}

testDatabase();
