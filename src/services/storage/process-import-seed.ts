import type { Pool } from 'pg';
import type { SeedExportPayload } from './process-export-seed';
import { SEED_TABLE_NAMES } from './seed-table-names';
import { listExistingSeedTables } from './list-existing-seed-tables';
import { normalizeSeedInsertValue, readColumnMeta } from './normalize-seed-insert-value';

export type ProcessImportSeedInput = {
  pool: Pool;
  payload: SeedExportPayload;
  mode: 'replace';
  confirm: string;
};

const REPLACE_CONFIRM = 'REPLACE_STUDIO_COMMIT_SUMMARIES';

const isSafeIdentifier = (name: string): boolean => /^[a-z_][a-z0-9_]*$/i.test(name);

/**
 * Replaces local table contents from a seed export payload (one transaction).
 */
export const processImportSeed = async (
  input: ProcessImportSeedInput,
): Promise<{ importedAt: string; tableRowCounts: Record<string, number> }> => {
  if (input.mode !== 'replace' || input.confirm !== REPLACE_CONFIRM) {
    throw new Error('Import requires mode replace and confirm REPLACE_STUDIO_COMMIT_SUMMARIES');
  }

  const client = await input.pool.connect();
  const tableRowCounts: Record<string, number> = {};

  try {
    await client.query('BEGIN');

    const existingTables = await listExistingSeedTables(client);
    if (existingTables.length > 0) {
      const truncateList = [...existingTables].reverse().join(', ');
      await client.query(`TRUNCATE TABLE ${truncateList} RESTART IDENTITY CASCADE`);
    }

    for (const table of SEED_TABLE_NAMES) {
      if (!existingTables.includes(table)) {
        continue;
      }
      if (!isSafeIdentifier(table)) {
        throw new Error(`Invalid table name: ${table}`);
      }
      const rows = input.payload.tables[table] ?? [];
      if (rows.length === 0) {
        tableRowCounts[table] = 0;
        continue;
      }
      const columns = Object.keys(rows[0]);
      for (const col of columns) {
        if (!isSafeIdentifier(col)) {
          throw new Error(`Invalid column name: ${col}`);
        }
      }
      const colList = columns.map((c) => `"${c}"`).join(', ');
      const columnMeta = await readColumnMeta(client, table);
      for (const row of rows) {
        const values = columns.map((col) =>
          normalizeSeedInsertValue(row[col], columnMeta.get(col)),
        );
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        try {
          await client.query(
            `INSERT INTO public.${table} (${colList}) VALUES (${placeholders})`,
            values,
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Insert failed';
          throw new Error(`Import failed on ${table}: ${message}`);
        }
      }
      tableRowCounts[table] = rows.length;
    }

    await client.query('COMMIT');
    return { importedAt: new Date().toISOString(), tableRowCounts };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export { REPLACE_CONFIRM };
