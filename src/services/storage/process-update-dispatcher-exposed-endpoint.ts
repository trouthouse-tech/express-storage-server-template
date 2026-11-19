import type { Pool } from 'pg';
import type {
  DispatcherExposedEndpoint,
  UpdateDispatcherExposedEndpointInput,
} from '../../model/dispatcher-exposed-endpoint';
import { updateDispatcherExposedEndpoint } from '../../data/dispatcher-exposed-endpoints/update-dispatcher-exposed-endpoint';

/**
 * Updates an exposed endpoint row by id.
 */
export const processUpdateDispatcherExposedEndpoint = async (
  pool: Pool,
  id: string,
  input: UpdateDispatcherExposedEndpointInput,
): Promise<DispatcherExposedEndpoint | null> => updateDispatcherExposedEndpoint(pool, id, input);
