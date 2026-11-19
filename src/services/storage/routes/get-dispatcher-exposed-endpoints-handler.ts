import type { Request, Response } from 'express';
import { requirePgPool } from '../../../utils/http';
import { processListDispatcherExposedEndpoints } from '../process-list-dispatcher-exposed-endpoints';

const ROUTE = 'GET /api/storage/dispatcher-exposed-endpoints';

const parseEnabledOnly = (raw: unknown): boolean => {
  if (raw === 'false' || raw === '0') {
    return false;
  }
  return true;
};

/**
 * GET /api/storage/dispatcher-exposed-endpoints?projectId=&enabledOnly=true
 */
export const getDispatcherExposedEndpointsHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log(`📥 ${ROUTE}`);

  const pool = requirePgPool(res);
  if (!pool) {
    return;
  }

  const projectId = typeof req.query.projectId === 'string' ? req.query.projectId.trim() : '';
  if (!projectId) {
    res.status(400).json({ success: false, error: 'projectId query required' });
    return;
  }

  const enabledOnly = parseEnabledOnly(req.query.enabledOnly);

  try {
    const endpoints = await processListDispatcherExposedEndpoints(pool, projectId, enabledOnly);
    console.log(`📤 ${ROUTE} status=200 count=${endpoints.length}`);
    res.status(200).json({ success: true, data: { endpoints } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'List failed';
    console.log(`❌ ${ROUTE} status=500 error=${message}`);
    res.status(500).json({ success: false, error: message });
  }
};
