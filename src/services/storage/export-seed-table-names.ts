import { SEED_TABLE_NAMES } from './seed-table-names';

/** Tables attempted on seed export (missing relations are skipped). */
export const EXPORT_SEED_TABLE_NAMES = [...SEED_TABLE_NAMES] as const;
