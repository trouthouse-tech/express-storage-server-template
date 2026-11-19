# express-storage-server-template

Storage-express starter: owns the product's Postgres (migrations + CRUD) and serves `POST /api/storage/v1/invoke` to the product's API express. Apps created from this template inherit these rules.

- Dev: `npm run dev` (nodemon + ts-node, port from `PORT`, default 3080) · Typecheck/build: `npm run build`
- Before any feature, read `.cursor/architecture/README.md` and the ADRs it points to. Path-scoped reminders load from `.claude/rules/` when you touch `src/data`, `src/services`, `src/model`, or SQL.
- Storage specifics: [011 – Storage data plane](.cursor/architecture/011-storage-api-split.md). Apply migrations with `npm run db:apply-migrations -- 0NN`.
- If no ADR covers a decision, propose a new ADR before writing code.
- `/adr-audit` checks the repo against its ADRs (read-only report).

## Agent rules (single source of truth, shared with Cursor)

@.cursor/rules/AGENTS.md
