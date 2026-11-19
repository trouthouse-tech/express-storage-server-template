import type { Request, Response } from 'express';
import { requirePgPool } from '../../../utils/http';
import { processExportSeed } from '../process-export-seed';

const EXPORT_ROUTE = 'POST /api/storage/seed/export';

/**
 * POST /api/storage/seed/export — consistent snapshot for dispatcher import.
 */
export const exportSeedHandler = async (_req: Request, res: Response): Promise<void> => {
  console.log(`📥 ${EXPORT_ROUTE}`);

  const pool = requirePgPool(res);
  if (!pool) {
    return;
  }

  try {
    const data = await processExportSeed(pool);
    const tableCount = Object.keys(data.tables ?? {}).length;
    console.log(`📤 ${EXPORT_ROUTE} status=200 tables=${tableCount}`);
    res.status(200).json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Export failed';
    console.log(`❌ ${EXPORT_ROUTE} status=500 error=${message}`);
    res.status(500).json({ success: false, error: message });
  }
};
