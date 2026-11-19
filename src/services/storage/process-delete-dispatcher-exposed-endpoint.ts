import type { Pool } from 'pg';
import { deleteDispatcherExposedEndpoint } from '../../data/dispatcher-exposed-endpoints/delete-dispatcher-exposed-endpoint';

/**
 * Deletes an exposed endpoint row by id.
 */
export const processDeleteDispatcherExposedEndpoint = async (pool: Pool, id: string): Promise<boolean> =>
  deleteDispatcherExposedEndpoint(pool, id);
