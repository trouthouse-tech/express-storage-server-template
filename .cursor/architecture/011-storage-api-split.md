# 011 - Storage data plane (storage-express)

## Status

Accepted

## Context

Each product has one **storage-express** repo (this template) that owns its Postgres database. The product's **API express** has no `DATABASE_URL` and no `pg`; it calls this server. Browsers never call storage.

```text
web → API express → (direct, or main gateway :3010 → project dispatcher) → storage /api/storage/v1/invoke → Postgres
```

## Decision

1. **Storage owns the schema.** All tables live in `migrations/0NN_name.sql`, applied with `npm run db:apply-migrations -- 0NN` (always pass the prefix on an existing database). No `CREATE FUNCTION/TRIGGER/PROCEDURE` ([010](./010-no-sql-functions.md)).
2. **CRUD in `src/data/{table}/`**, one exported function per file, `pool: Pool` first ([003](./003-data-layer-crud-boundaries.md)). Types from `src/model/{entity}/index.ts` ([008](./008-domain-models.md)).
3. **Invoke whitelist = data barrels.** `src/services/storage/build-storage-operation-registry.ts` imports each `src/data/{table}` barrel; every exported function becomes an operation with the **same name**. Duplicate names throw at startup. Restart storage after adding operations.
4. **One endpoint for data:** `POST /api/storage/v1/invoke` with `{ "operation": "getThingById", "args": ["<id>"] }` → `{ success, data }`. Unknown operation → 404; a thrown error → 400.
5. **Auth:** every `/api/storage/*` route except `GET /api/storage/health` requires `x-storage-secret: $STORAGE_DISPATCHER_SECRET`. In gateway mode the project dispatcher injects it.
6. **Register every table** in `src/services/storage/seed-table-names.ts` in FK order. Seed export/import and `GET /api/storage/meta` read that list.
7. **API express mirrors operations** with same-name wrappers in its own `src/data/{table}/` that call invoke. Models in `src/model` are identical across storage, API express and web.

## Adding a table

1. `migrations/0NN_create_{table}.sql` (standard `id`, `created_at`, `updated_at`; `IF NOT EXISTS`).
2. `src/model/{entity}/index.ts` (+ `export type * from './{entity}'` in `src/model/index.ts`).
3. `src/data/{table}/*.ts` + `index.ts` barrel.
4. Add the barrel to `build-storage-operation-registry.ts` and the table to `seed-table-names.ts`.
5. `npm run db:apply-migrations -- 0NN`, restart, invoke.

## Related

- [012 – Dispatcher exposed endpoints](./012-dispatcher-exposed-endpoints.md)
