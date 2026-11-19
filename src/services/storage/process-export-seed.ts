import type { Pool } from 'pg';
import { EXPORT_SEED_TABLE_NAMES } from './export-seed-table-names';
import { isMissingTableError } from '../../utils/postgres/is-missing-table-error';

export type SeedExportPayload = {
  exportedAt: string;
  tables: Record<string, Record<string, unknown>[]>;
};

/**
 * Reads application tables in one transaction for cross-host seed import.
 * Skips tables that are not present yet.
 */
export const processExportSeed = async (pool: Pool): Promise<SeedExportPayload> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const tables: Record<string, Record<string, unknown>[]> = {};
    for (const table of EXPORT_SEED_TABLE_NAMES) {
      try {
        const result = await client.query(`SELECT * FROM public.${table}`);
        tables[table] = result.rows as Record<string, unknown>[];
      } catch (error) {
        if (isMissingTableError(error as { code?: string; message?: string })) {
          continue;
        }
        throw error;
      }
    }
    await client.query('COMMIT');
    return {
      exportedAt: new Date().toISOString(),
      tables,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
