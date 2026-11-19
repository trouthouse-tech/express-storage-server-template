import type { PoolClient } from 'pg';

type ColumnMeta = { dataType: string; udtName: string };

const columnMetaCache = new Map<string, Map<string, ColumnMeta>>();

const readColumnMeta = async (client: PoolClient, table: string): Promise<Map<string, ColumnMeta>> => {
  const cached = columnMetaCache.get(table);
  if (cached) {
    return cached;
  }
  const result = await client.query<{ column_name: string; data_type: string; udt_name: string }>(
    `SELECT column_name, data_type, udt_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1`,
    [table],
  );
  const map = new Map<string, ColumnMeta>();
  for (const row of result.rows) {
    map.set(row.column_name, { dataType: row.data_type, udtName: row.udt_name });
  }
  columnMetaCache.set(table, map);
  return map;
};

const parseJsonString = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error('invalid input syntax for type json');
  }
};

/**
 * Coerces seed row values for dynamic INSERT (jsonb, arrays, dates over HTTP).
 */
export const normalizeSeedInsertValue = (
  value: unknown,
  meta: ColumnMeta | undefined,
): unknown => {
  if (value === undefined) {
    return null;
  }
  if (value === null) {
    return null;
  }
  if (!meta) {
    return value;
  }

  if (meta.dataType === 'json' || meta.dataType === 'jsonb' || meta.udtName === 'jsonb') {
    if (value === null) {
      return null;
    }
    if (typeof value === 'string') {
      parseJsonString(value);
      return value;
    }
    return JSON.stringify(value);
  }

  if (meta.dataType === 'ARRAY') {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = parseJsonString(value);
      if (!Array.isArray(parsed)) {
        throw new Error('malformed array literal');
      }
      return parsed;
    }
  }

  if (value instanceof Date) {
    return value;
  }
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return value;
};

export { readColumnMeta };
