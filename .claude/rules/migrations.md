---
paths:
  - "migrations/**"
  - "**/*.sql"
---

# SQL migrations

Read: [010 – No SQL functions](../../.cursor/architecture/010-no-sql-functions.md).

- Tables, indexes, grants, RLS, `CHECK` only. **Never** `CREATE FUNCTION`, `CREATE TRIGGER`, `CREATE PROCEDURE`, `EXECUTE FUNCTION`.
- `default now()` / `gen_random_uuid()` are fine; `updated_at` is set by CRUD code.
- New file = next number (`0NN_name.sql`); never edit an applied migration.
- Apply with `npm run db:apply-migrations -- 0NN` (always pass the prefix on an existing database).
- Every new table goes into `src/services/storage/seed-table-names.ts` in FK order. See [011 – Storage data plane](../../.cursor/architecture/011-storage-api-split.md).
