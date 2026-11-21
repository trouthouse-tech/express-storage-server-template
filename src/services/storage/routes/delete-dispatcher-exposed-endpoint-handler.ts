import type { Request, Response } from 'express';
import { requirePgPool } from '../../../utils/http';
import { deleteDispatcherExposedEndpoint } from '../../../data/dispatcher-exposed-endpoints/delete-dispatcher-exposed-endpoint';

const ROUTE = 'DELETE /api/storage/dispatcher-exposed-endpoints/:id';

/**
 * DELETE /api/storage/dispatcher-exposed-endpoints/:id
 */
export const deleteDispatcherExposedEndpointHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log(`📥 ${ROUTE}`);

  const pool = requirePgPool(res);
  if (!pool) {
    return;
  }

  const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
  if (!id) {
    res.status(400).json({ success: false, error: 'id required' });
    return;
  }

  try {
    const deleted = await deleteDispatcherExposedEndpoint(pool, id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Endpoint not found' });
      return;
    }
    console.log(`📤 ${ROUTE} status=200 id=${id}`);
    res.status(200).json({ success: true, data: { deleted: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    console.log(`❌ ${ROUTE} status=500 error=${message}`);
    res.status(500).json({ success: false, error: message });
  }
};
