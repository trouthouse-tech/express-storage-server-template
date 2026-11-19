---
paths:
  - "src/data/**"
---

# `src/data/` — CRUD only

Read before editing: [003 – Data layer CRUD boundaries](../../.cursor/architecture/003-data-layer-crud-boundaries.md), [008 – Domain models](../../.cursor/architecture/008-domain-models.md).

- One table folder, **one exported CRUD function per file**, JSDoc on each.
- **No `types.ts` here** — import row/input types from `src/model/{entity}`.
- No business rules, orchestration, or HTTP (`req`/`res`) in CRUD files.
- Barrel `index.ts` exports CRUD functions only.
- Storage data functions take `pool: Pool` first and never call `getManagedPgPool()` themselves.
- Each table barrel is registered in `src/services/storage/build-storage-operation-registry.ts`; the function name is the invoke operation ([011](../../.cursor/architecture/011-storage-api-split.md)).
