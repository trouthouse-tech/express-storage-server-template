import type { DispatcherExposedEndpoint } from '../../model/dispatcher-exposed-endpoint';

export type DispatcherExposedEndpointRow = {
  id: string;
  project_id: string;
  service_id: string;
  method: DispatcherExposedEndpoint['method'];
  path: string;
  summary: string;
  requires_body: boolean;
  enabled: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
};

/**
 * Maps a database row to a dispatcher exposed endpoint model.
 */
export const mapDispatcherExposedEndpointRow = (
  row: DispatcherExposedEndpointRow,
): DispatcherExposedEndpoint => ({
  id: row.id,
  projectId: row.project_id,
  serviceId: row.service_id,
  method: row.method,
  path: row.path,
  summary: row.summary,
  requiresBody: row.requires_body,
  enabled: row.enabled,
  sortOrder: row.sort_order,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});
