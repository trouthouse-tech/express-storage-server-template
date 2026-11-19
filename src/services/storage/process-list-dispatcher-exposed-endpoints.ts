import type { Pool } from 'pg';
import type { DispatcherExposedEndpoint } from '../../model/dispatcher-exposed-endpoint';
import { listDispatcherExposedEndpointsByProject } from '../../data/dispatcher-exposed-endpoints/list-dispatcher-exposed-endpoints-by-project';
import { listEnabledDispatcherExposedEndpointsByProject } from '../../data/dispatcher-exposed-endpoints/list-enabled-dispatcher-exposed-endpoints-by-project';

/**
 * Lists exposed endpoint rows for a project (optionally enabled only).
 */
export const processListDispatcherExposedEndpoints = async (
  pool: Pool,
  projectId: string,
  enabledOnly: boolean,
): Promise<DispatcherExposedEndpoint[]> => {
  if (enabledOnly) {
    return listEnabledDispatcherExposedEndpointsByProject(pool, projectId);
  }
  return listDispatcherExposedEndpointsByProject(pool, projectId);
};
