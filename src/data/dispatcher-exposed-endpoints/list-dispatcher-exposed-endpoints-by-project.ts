import type { Pool } from 'pg';
import type { DispatcherExposedEndpoint } from '../../model/dispatcher-exposed-endpoint';
import {
  mapDispatcherExposedEndpointRow,
  type DispatcherExposedEndpointRow,
} from './map-dispatcher-exposed-endpoint-row';

/**
 * Lists all exposed endpoint rows for a project (admin).
 */
export const listDispatcherExposedEndpointsByProject = async (
  pool: Pool,
  projectId: string,
): Promise<DispatcherExposedEndpoint[]> => {
  const result = await pool.query(
    `SELECT id, project_id, service_id, method, path, summary, requires_body, enabled, sort_order, created_at, updated_at
     FROM dispatcher_exposed_endpoints
     WHERE project_id = $1
     ORDER BY sort_order ASC, id ASC`,
    [projectId],
  );
  return (result.rows as DispatcherExposedEndpointRow[]).map(mapDispatcherExposedEndpointRow);
};
