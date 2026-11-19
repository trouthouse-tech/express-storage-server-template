import type { Pool } from 'pg';
import type {
  DispatcherExposedEndpoint,
  InsertDispatcherExposedEndpointInput,
} from '../../model/dispatcher-exposed-endpoint';
import {
  mapDispatcherExposedEndpointRow,
  type DispatcherExposedEndpointRow,
} from './map-dispatcher-exposed-endpoint-row';

/**
 * Inserts a dispatcher exposed endpoint row.
 */
export const insertDispatcherExposedEndpoint = async (
  pool: Pool,
  input: InsertDispatcherExposedEndpointInput,
): Promise<DispatcherExposedEndpoint> => {
  const now = new Date();
  const result = await pool.query(
    `INSERT INTO dispatcher_exposed_endpoints (
      id, project_id, service_id, method, path, summary, requires_body, enabled, sort_order, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)
    RETURNING id, project_id, service_id, method, path, summary, requires_body, enabled, sort_order, created_at, updated_at`,
    [
      input.id,
      input.projectId,
      input.serviceId,
      input.method,
      input.path,
      input.summary,
      input.requiresBody ?? false,
      input.enabled ?? true,
      input.sortOrder ?? 0,
      now,
    ],
  );
  return mapDispatcherExposedEndpointRow(result.rows[0] as DispatcherExposedEndpointRow);
};
