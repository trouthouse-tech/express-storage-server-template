import type { Pool } from 'pg';
import { isMissingTableError } from '../../utils/postgres/is-missing-table-error';
import { SEED_TABLE_NAMES } from './seed-table-names';

export type StorageMeta = {
  tables: Record<string, { rowCount: number; maxUpdatedAt: string | null }>;
  operationCount: number;
};

/**
 * Returns row counts and max updated_at for every table in SEED_TABLE_NAMES (missing tables are skipped).
 */
export const processGetMeta = async (
  pool: Pool,
  operationCount: number,
): Promise<StorageMeta> => {
  const tables: StorageMeta['tables'] = {};

  for (const table of SEED_TABLE_NAMES) {
    let countResult;
    try {
      countResult = await pool.query<{ count: string }>(`SELECT count(*)::text AS count FROM public.${table}`);
    } catch (error) {
      if (isMissingTableError(error as { code?: string; message?: string })) continue;
      throw error;
    }
    let maxUpdatedAt: string | null = null;
    try {
      const maxResult = await pool.query<{ max: string | null }>(
        `SELECT max(updated_at)::text AS max FROM public.${table}`,
      );
      maxUpdatedAt = maxResult.rows[0]?.max ?? null;
    } catch {
      maxUpdatedAt = null;
    }
    tables[table] = {
      rowCount: Number(countResult.rows[0]?.count ?? 0),
      maxUpdatedAt,
    };
  }

  return { tables, operationCount };
};
