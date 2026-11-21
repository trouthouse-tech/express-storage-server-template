/**
 * Applies migrations/*.sql to DATABASE_URL in filename order. Creates the database first when it
 * does not exist yet (fresh start), using the same credentials against the `postgres` database.
 *
 * Usage: npm run db:apply-migrations            (fresh database: every file)
 *        npm run db:apply-migrations -- 003 004 (existing database: only these prefixes)
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Client, Pool } from 'pg';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

const migrationsDir = path.resolve(__dirname, '../migrations');

/** Postgres "database does not exist". */
const DATABASE_MISSING = '3D000';

const quoteIdentifier = (name: string): string => `"${name.replace(/"/g, '""')}"`;

/** Creates DATABASE_URL's database when it is missing; no-op when it exists. */
const ensureDatabase = async (connectionString: string): Promise<void> => {
  const probe = new Client({ connectionString });
  try {
    await probe.connect();
    return;
  } catch (error) {
    if ((error as { code?: string }).code !== DATABASE_MISSING) throw error;
  } finally {
    await probe.end().catch(() => undefined);
  }

  const url = new URL(connectionString);
  const name = decodeURIComponent(url.pathname.replace(/^\//, ''));
  if (!name) throw new Error('DATABASE_URL has no database name');
  url.pathname = '/postgres';
  const admin = new Client({ connectionString: url.toString() });
  await admin.connect();
  try {
    console.log(`🆕 Creating database ${name}`);
    await admin.query(`CREATE DATABASE ${quoteIdentifier(name)}`);
  } finally {
    await admin.end();
  }
};

const run = async (): Promise<void> => {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    console.error('❌ DATABASE_URL is required');
    process.exit(1);
  }

  // Optional filename prefixes (e.g. `npm run db:apply-migrations -- 095 096`) apply only those
  // files. Use this on existing databases: re-running every file after 096 would recreate legacy tables.
  const only = process.argv.slice(2).map((arg) => arg.trim()).filter(Boolean);

  const files = fs
    .readdirSync(migrationsDir)
    .filter((name) => name.endsWith('.sql'))
    .filter((name) => only.length === 0 || only.some((prefix) => name.startsWith(prefix)))
    .sort();

  if (files.length === 0) {
    console.error(only.length ? `❌ No migration files match: ${only.join(', ')}` : '❌ No migration files found');
    process.exit(1);
  }

  try {
    await ensureDatabase(connectionString);
  } catch (error) {
    console.error('❌ Could not reach or create the database:', error);
    process.exit(1);
  }

  const pool = new Pool({ connectionString });

  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`🚀 Applying ${file}`);
      await pool.query(sql);
      console.log(`✅ Applied ${file}`);
    }
    console.log('✅ All migrations applied');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

void run();
