import type { Request, Response } from 'express';
import { requirePgPool } from '../../../utils/http';
import { buildStorageOperationRegistry } from '../build-storage-operation-registry';
import { processGetMeta } from '../process-get-meta';

const META_ROUTE = 'GET /api/storage/meta';

/**
 * GET /api/storage/meta — table counts (dispatcher secret required).
 */
export const storageMetaHandler = async (_req: Request, res: Response): Promise<void> => {
  console.log(`📥 ${META_ROUTE}`);

  const pool = requirePgPool(res);
  if (!pool) {
    return;
  }

  try {
    const operationCount = Object.keys(buildStorageOperationRegistry()).length;
    const data = await processGetMeta(pool, operationCount);
    const tableCount = Object.keys(data.tables).length;
    console.log(`📤 ${META_ROUTE} status=200 tables=${tableCount}`);
    res.status(200).json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Meta failed';
    console.log(`❌ ${META_ROUTE} status=500 error=${message}`);
    res.status(500).json({ success: false, error: message });
  }
};
