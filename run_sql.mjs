import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

async function run() {
  try {
    console.log('Adding Round 2 and Round 3 columns...');
    await sql`ALTER TABLE "exam_attempts" ADD COLUMN IF NOT EXISTS "round2_score" integer;`;
    await sql`ALTER TABLE "exam_attempts" ADD COLUMN IF NOT EXISTS "round3_score" integer;`;
    console.log('Successfully added new columns!');
  } catch (err) {
    console.error('Error:', err);
  }
}
run();
