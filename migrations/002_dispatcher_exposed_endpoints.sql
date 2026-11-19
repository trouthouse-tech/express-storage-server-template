-- Paths the main gateway may forward to this project's services (project dispatcher catalog).
-- Rows are project-specific: add them for your project (storage health/meta/invoke at minimum)
-- in a later migration or through the dispatcher-exposed-endpoints API.
CREATE TABLE IF NOT EXISTS dispatcher_exposed_endpoints (
  id text PRIMARY KEY,
  project_id text NOT NULL,
  service_id text NOT NULL,
  method text NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
  path text NOT NULL,
  summary text NOT NULL DEFAULT '',
  requires_body boolean NOT NULL DEFAULT false,
  enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, method, path)
);

CREATE INDEX IF NOT EXISTS idx_dispatcher_exposed_endpoints_project_enabled
  ON dispatcher_exposed_endpoints (project_id, enabled);

CREATE INDEX IF NOT EXISTS idx_dispatcher_exposed_endpoints_path
  ON dispatcher_exposed_endpoints (path);
