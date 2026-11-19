/**
 * Every table this storage owns, in FK-safe order (parents before children).
 * Used by seed export/import and by GET /api/storage/meta. Add each new table here.
 */
export const SEED_TABLE_NAMES = ['dispatcher_exposed_endpoints'] as const;

export type SeedTableName = (typeof SEED_TABLE_NAMES)[number];
