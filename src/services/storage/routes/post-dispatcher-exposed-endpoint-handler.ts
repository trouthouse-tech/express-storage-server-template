import type { Request, Response } from 'express';
import type { InsertDispatcherExposedEndpointInput } from '../../../model/dispatcher-exposed-endpoint';
import { requirePgPool } from '../../../utils/http';
import { insertDispatcherExposedEndpoint } from '../../../data/dispatcher-exposed-endpoints/insert-dispatcher-exposed-endpoint';

const ROUTE = 'POST /api/storage/dispatcher-exposed-endpoints';

/**
 * POST /api/storage/dispatcher-exposed-endpoints
 */
export const postDispatcherExposedEndpointHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log(`📥 ${ROUTE}`);

  const pool = requirePgPool(res);
  if (!pool) {
    return;
  }

  const body = req.body as Partial<InsertDispatcherExposedEndpointInput>;
  if (!body.id?.trim() || !body.projectId?.trim() || !body.serviceId?.trim() || !body.method || !body.path?.trim()) {
    res.status(400).json({ success: false, error: 'id, projectId, serviceId, method, and path are required' });
    return;
  }

  try {
    const endpoint = await insertDispatcherExposedEndpoint(pool, {
      id: body.id.trim(),
      projectId: body.projectId.trim(),
      serviceId: body.serviceId.trim(),
      method: body.method,
      path: body.path.trim(),
      summary: body.summary?.trim() ?? '',
      requiresBody: body.requiresBody,
      enabled: body.enabled,
      sortOrder: body.sortOrder,
    });
    console.log(`📤 ${ROUTE} status=200 id=${endpoint.id}`);
    res.status(200).json({ success: true, data: { endpoint } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Create failed';
    console.log(`❌ ${ROUTE} status=500 error=${message}`);
    res.status(500).json({ success: false, error: message });
  }
};
