import type { Request, Response } from 'express';
import type { UpdateDispatcherExposedEndpointInput } from '../../../model/dispatcher-exposed-endpoint';
import { requirePgPool } from '../../../utils/http';
import { updateDispatcherExposedEndpoint } from '../../../data/dispatcher-exposed-endpoints/update-dispatcher-exposed-endpoint';

const ROUTE = 'PATCH /api/storage/dispatcher-exposed-endpoints/:id';

/**
 * PATCH /api/storage/dispatcher-exposed-endpoints/:id
 */
export const patchDispatcherExposedEndpointHandler = async (
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

  const body = req.body as UpdateDispatcherExposedEndpointInput;

  try {
    const endpoint = await updateDispatcherExposedEndpoint(pool, id, body);
    if (!endpoint) {
      res.status(404).json({ success: false, error: 'Endpoint not found' });
      return;
    }
    console.log(`📤 ${ROUTE} status=200 id=${id}`);
    res.status(200).json({ success: true, data: { endpoint } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Update failed';
    console.log(`❌ ${ROUTE} status=500 error=${message}`);
    res.status(500).json({ success: false, error: message });
  }
};
