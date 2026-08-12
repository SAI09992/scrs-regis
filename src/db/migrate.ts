import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';
import { seedDatabase } from './seed';

async function runMigration() {
  console.log('--- Initializing Neon PostgreSQL Schema via HTTP ---');
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_G9OX6JTuKnYC@ep-floral-sky-avnwvdc1.c-11.us-east-1.aws.neon.tech/neondb?sslmode=require';

  const sql = neon(connectionString);

  try {
    const migrationFilePath = path.join(__dirname, 'migrations', '0000_lumpy_red_ghost.sql');
    if (fs.existsSync(migrationFilePath)) {
      const sqlContent = fs.readFileSync(migrationFilePath, 'utf8');
      const statements = sqlContent.split('--> statement-breakpoint');

      for (const statement of statements) {
        const trimmed = statement.trim();
        if (trimmed) {
          try {
            await sql(trimmed);
          } catch (e: any) {
            // Ignore if already exists
            if (!e.message.includes('already exists') && !e.message.includes('duplicate')) {
              console.warn('Notice during migration:', e.message);
            }
          }
        }
      }
      console.log('✓ Tables, unique constraints, and indexes initialized in Neon DB');
    }

    // Run seed
    await seedDatabase();
    console.log('✓ Database ready for production.');
  } catch (err) {
    console.error('Migration error:', err);
    throw err;
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
