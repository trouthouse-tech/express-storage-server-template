import type { Pool } from 'pg';
import type {
  DispatcherExposedEndpoint,
  UpdateDispatcherExposedEndpointInput,
} from '../../model/dispatcher-exposed-endpoint';
import {
  mapDispatcherExposedEndpointRow,
  type DispatcherExposedEndpointRow,
} from './map-dispatcher-exposed-endpoint-row';

/**
 * Updates a dispatcher exposed endpoint row by id.
 */
export const updateDispatcherExposedEndpoint = async (
  pool: Pool,
  id: string,
  input: UpdateDispatcherExposedEndpointInput,
): Promise<DispatcherExposedEndpoint | null> => {
  const sets: string[] = [];
  const values: unknown[] = [];
  let index = 1;

  const assign = (column: string, value: unknown): void => {
    sets.push(`${column} = $${index}`);
    values.push(value);
    index += 1;
  };

  if (input.serviceId !== undefined) assign('service_id', input.serviceId);
  if (input.method !== undefined) assign('method', input.method);
  if (input.path !== undefined) assign('path', input.path);
  if (input.summary !== undefined) assign('summary', input.summary);
  if (input.requiresBody !== undefined) assign('requires_body', input.requiresBody);
  if (input.enabled !== undefined) assign('enabled', input.enabled);
  if (input.sortOrder !== undefined) assign('sort_order', input.sortOrder);

  if (sets.length === 0) {
    const existing = await pool.query(
      `SELECT id, project_id, service_id, method, path, summary, requires_body, enabled, sort_order, created_at, updated_at
       FROM dispatcher_exposed_endpoints WHERE id = $1`,
      [id],
    );
    const row = existing.rows[0] as DispatcherExposedEndpointRow | undefined;
    return row ? mapDispatcherExposedEndpointRow(row) : null;
  }

  assign('updated_at', new Date());
  values.push(id);

  const result = await pool.query(
    `UPDATE dispatcher_exposed_endpoints SET ${sets.join(', ')}
     WHERE id = $${index}
     RETURNING id, project_id, service_id, method, path, summary, requires_body, enabled, sort_order, created_at, updated_at`,
    values,
  );
  const row = result.rows[0] as DispatcherExposedEndpointRow | undefined;
  return row ? mapDispatcherExposedEndpointRow(row) : null;
};
