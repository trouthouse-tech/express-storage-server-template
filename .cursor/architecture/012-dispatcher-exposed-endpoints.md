# 012 - Dispatcher exposed endpoints

## Status

Accepted

## Context

The main gateway forwards `/{projectId}/...` to the project's dispatcher, which only proxies paths listed in this storage's `dispatcher_exposed_endpoints` table (migration 002).

## Decision

- Each project lists at least its storage paths: `GET /api/storage/health`, `GET /api/storage/meta`, `POST /api/storage/v1/invoke` (service `{project}-storage`). API express paths are added when the web needs them through the gateway.
- Rows are project-specific, so the template ships the table only. Code Control's **Dispatcher** tab generates the seed migration (`migrations/NNN_dispatcher_exposed_endpoints_{project}.sql`, `ON CONFLICT DO NOTHING`) with the storage trio for service `{project}-storage`. Add more rows in a later migration or through the admin routes:
  `GET|POST /api/storage/dispatcher-exposed-endpoints`, `PATCH|DELETE /api/storage/dispatcher-exposed-endpoints/:id` (storage secret required).

```sql
INSERT INTO dispatcher_exposed_endpoints (id, project_id, service_id, method, path, summary, requires_body, enabled, sort_order) VALUES
  ('{project}-storage-health', '{project}', '{project}-storage', 'GET', '/api/storage/health', 'Storage liveness', false, true, 10),
  ('{project}-storage-meta', '{project}', '{project}-storage', 'GET', '/api/storage/meta', 'Storage meta', false, true, 20),
  ('{project}-storage-v1-invoke', '{project}', '{project}-storage', 'POST', '/api/storage/v1/invoke', 'Storage invoke', true, true, 30)
ON CONFLICT (id) DO NOTHING;
```

- Paths must sit under the owning service's `pathPrefix` (`/api/storage` for storage, `/api/data` for the API); the project dispatcher drops rows that do not (express template ADR 012).
