import type { Pool } from 'pg';
import type { DispatcherExposedEndpoint } from '../../model/dispatcher-exposed-endpoint';
import {
  mapDispatcherExposedEndpointRow,
  type DispatcherExposedEndpointRow,
} from './map-dispatcher-exposed-endpoint-row';

/**
 * Finds an enabled exposed endpoint by project, method, and path.
 */
export const getDispatcherExposedEndpointByMethodPath = async (
  pool: Pool,
  projectId: string,
  method: string,
  path: string,
): Promise<DispatcherExposedEndpoint | null> => {
  const result = await pool.query(
    `SELECT id, project_id, service_id, method, path, summary, requires_body, enabled, sort_order, created_at, updated_at
     FROM dispatcher_exposed_endpoints
     WHERE project_id = $1 AND method = $2 AND path = $3 AND enabled = true
     LIMIT 1`,
    [projectId, method, path],
  );
  const row = result.rows[0] as DispatcherExposedEndpointRow | undefined;
  return row ? mapDispatcherExposedEndpointRow(row) : null;
};
