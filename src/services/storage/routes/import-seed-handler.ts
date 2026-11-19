import type { Request, Response } from 'express';
import { requirePgPool } from '../../../utils/http';
import type { SeedExportPayload } from '../process-export-seed';
import { processImportSeed } from '../process-import-seed';

type ImportBody = SeedExportPayload & {
  mode?: string;
  confirm?: string;
};

const IMPORT_ROUTE = 'POST /api/storage/seed/import';

/**
 * POST /api/storage/seed/import — replace tables from export payload.
 */
export const importSeedHandler = async (req: Request, res: Response): Promise<void> => {
  const pool = requirePgPool(res);
  if (!pool) {
    return;
  }

  const body = req.body as ImportBody;
  if (!body.tables || typeof body.tables !== 'object') {
    console.log(`📥 ${IMPORT_ROUTE}`);
    console.log(`❌ ${IMPORT_ROUTE} status=400 error=tables payload is required`);
    res.status(400).json({ success: false, error: 'tables payload is required' });
    return;
  }

  const tableCount = Object.keys(body.tables).length;
  console.log(`📥 ${IMPORT_ROUTE} tables=${tableCount}`);

  try {
    const data = await processImportSeed({
      pool,
      payload: {
        exportedAt: body.exportedAt ?? new Date().toISOString(),
        tables: body.tables,
      },
      mode: 'replace',
      confirm: body.confirm ?? '',
    });
    console.log(`📤 ${IMPORT_ROUTE} status=200`);
    res.status(200).json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Import failed';
    const status = message.includes('confirm') ? 400 : 500;
    console.log(`❌ ${IMPORT_ROUTE} status=${status} error=${message}`);
    res.status(status).json({ success: false, error: message });
  }
};
