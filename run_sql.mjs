import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

async function run() {
  try {
    const q1 = `
    DO $$ BEGIN
     ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_registration_id_registrations_id_fk" FOREIGN KEY ("registration_id") REFERENCES "public"."registrations"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
     WHEN duplicate_object THEN null;
    END $$;
    `;
    const q2 = `CREATE UNIQUE INDEX IF NOT EXISTS "exam_attempts_reg_id_idx" ON "exam_attempts" USING btree ("registration_id");`;
    const q3 = `CREATE INDEX IF NOT EXISTS "exam_attempts_status_idx" ON "exam_attempts" USING btree ("status");`;
    const q4 = `CREATE INDEX IF NOT EXISTS "exam_questions_order_idx" ON "exam_questions" USING btree ("order_index");`;
    
    await sql(q1);
    await sql(q2);
    await sql(q3);
    await sql(q4);
    console.log('Successfully added constraints and indexes!');
  } catch (err) {
    console.error('Error:', err);
  }
}
run();
