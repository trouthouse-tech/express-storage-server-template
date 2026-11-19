# Express Storage Server Template

Storage-express starter for a product: it **owns the Postgres database** (migrations + CRUD) and exposes one data endpoint, `POST /api/storage/v1/invoke`, to the product's API express. Browsers never call it.

```text
web → API express → (direct, or main gateway → project dispatcher) → storage → Postgres
```

## Quick start

```bash
gh repo create my-product-storage-express-server --template trouthouse-tech/express-storage-server-template --private --clone
cd my-product-storage-express-server
npm install
cp .env.example .env          # set DATABASE_URL and STORAGE_DISPATCHER_SECRET
createdb my_product
npm run db:apply-migrations   # fresh database: applies every file in migrations/
npm run dev                   # http://127.0.0.1:3080
```

```bash
curl http://127.0.0.1:3080/api/storage/health
curl -X POST http://127.0.0.1:3080/api/storage/v1/invoke \
  -H "x-storage-secret: $STORAGE_DISPATCHER_SECRET" -H 'content-type: application/json' \
  -d '{"operation":"listDispatcherExposedEndpointsByProject","args":["my-product"]}'
```

## Endpoints

| Route | Auth | Purpose |
|---|---|---|
| `GET /api/storage/health` | public | Liveness |
| `POST /api/storage/v1/invoke` | `x-storage-secret` | Run a whitelisted data function: `{ operation, args }` → `{ success, data }` |
| `GET /api/storage/meta` | `x-storage-secret` | Row counts per table in `seed-table-names.ts` |
| `POST /api/storage/seed/export`, `/seed/import` | `x-storage-secret` | Copy table data between databases |
| `/api/storage/dispatcher-exposed-endpoints` | `x-storage-secret` | Gateway path catalog admin |

## Adding a table

1. `migrations/0NN_create_{table}.sql`: standard `id uuid`, `created_at`, `updated_at`; `IF NOT EXISTS`; no functions or triggers.
2. `src/model/{entity}/index.ts` and `export type * from './{entity}'` in `src/model/index.ts`.
3. `src/data/{table}/` with one function per file (`pool: Pool` first) and an `index.ts` barrel.
4. Register the barrel in `src/services/storage/build-storage-operation-registry.ts` and the table in `src/services/storage/seed-table-names.ts`.
5. `npm run db:apply-migrations -- 0NN`, restart, then invoke the new operations.

## Migrations

`npm run db:apply-migrations` applies every file in `migrations/` in order; on an existing database always pass prefixes: `npm run db:apply-migrations -- 003 004`.

## Layout

```text
index.ts                       # bootstrap: managed pg pool → routers → listen
migrations/                    # 001_extensions, 002_dispatcher_exposed_endpoints, …
scripts/apply-migrations.ts
src/model/{entity}/index.ts    # row + Create/Update input types
src/data/{table}/              # CRUD only, one function per file
src/services/storage/          # invoke, registry, meta, seed, dispatcher endpoints, auth
src/services/postgres|managed  # pool created once at startup
src/utils/http|postgres        # requirePgPool, safeEqualSecret, buildUpdateAssignments…
```

## Architecture & agent rules

Read `.cursor/architecture/README.md` first; storage specifics are in [011](.cursor/architecture/011-storage-api-split.md) and [012](.cursor/architecture/012-dispatcher-exposed-endpoints.md). Path-scoped reminders live in `.claude/rules/`.

## License

MIT
