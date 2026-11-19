import type { PoolClient } from 'pg';
import { SEED_TABLE_NAMES, type SeedTableName } from './seed-table-names';

/**
 * Seed tables that exist in public schema (skips dropped legacy tables).
 */
export const listExistingSeedTables = async (client: PoolClient): Promise<SeedTableName[]> => {
  const names = [...SEED_TABLE_NAMES];
  const result = await client.query<{ table_name: string }>(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = ANY($1::text[])`,
    [names],
  );
  const existing = new Set(result.rows.map((row) => row.table_name));
  return names.filter((name) => existing.has(name));
};
