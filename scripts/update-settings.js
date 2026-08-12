// Update event_settings to match current project specs
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

async function updateSettings() {
  const sql = neon(process.env.DATABASE_URL);

  console.log('🔧 Updating event_settings to match current specs...');

  await sql`
    UPDATE event_settings SET
      total_capacity = 200,
      registration_fee_ue = 300,
      registration_fee_other = 300,
      payment_upi_id = 'scrs@upi',
      event_name = 'NEXTGEN SOC',
      tagline = 'Detect. Defend. Respond.',
      dates = 'August 29 – 30, 2026',
      venue = 'TIFAC Core Seminar Hall',
      updated_at = NOW()
    WHERE id = (SELECT id FROM event_settings LIMIT 1)
  `;

  console.log('✅ Event settings updated:');
  console.log('   Total Capacity: 200');
  console.log('   Fee: ₹300 (flat)');
  console.log('   UPI ID: scrs@upi');
  console.log('   Dates: August 29-30, 2026');
  console.log('   Venue: TIFAC Core Seminar Hall');

  // Verify
  const settings = await sql`SELECT * FROM event_settings LIMIT 1`;
  console.log('\n🔍 Verified settings:', JSON.stringify(settings[0], null, 2));
}

updateSettings().catch(console.error);
