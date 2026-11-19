import type { Pool } from 'pg';
import type {
  DispatcherExposedEndpoint,
  InsertDispatcherExposedEndpointInput,
} from '../../model/dispatcher-exposed-endpoint';
import { insertDispatcherExposedEndpoint } from '../../data/dispatcher-exposed-endpoints/insert-dispatcher-exposed-endpoint';

/**
 * Inserts an exposed endpoint row (no dispatcher registry validation).
 */
export const processCreateDispatcherExposedEndpoint = async (
  pool: Pool,
  input: InsertDispatcherExposedEndpointInput,
): Promise<DispatcherExposedEndpoint> => insertDispatcherExposedEndpoint(pool, input);
