# @exam-one/database

[Back to the project README](../../README.md#project-structure)

Owns the PostgreSQL schema, Prisma migrations, Prisma Client exports and bundled-content seed upserts. This internal workspace package is used by backend infrastructure, backend model imports and database scripts.

## Contents

| Path | Responsibility |
| --- | --- |
| [prisma/schema.prisma](prisma/schema.prisma) | Models, relationships, indexes and client generation configuration |
| [prisma/migrations/](prisma/migrations/) | Forward SQL migrations, including partial unique indexes |
| [prisma/seed.ts](prisma/seed.ts) | Prisma seed command entry point |
| [src/seed.ts](src/seed.ts) | Idempotent catalog upserts and `seedCatalog` export |
| [src/index.ts](src/index.ts) | Re-exports Prisma Client/model types and seed helpers |
| [scripts/set-password.ts](scripts/set-password.ts) | Local account password recovery utility |

## When to change it

Change this package for table, column, relation, index or seed-persistence changes. It imports bundled Goethe A2 content from [`@exam-one/exam-packs`](../../data/README.md). [nestjs-libraries](../nestjs-libraries/README.md) wraps its Prisma Client in an injectable NestJS service.

Pack definitions and grading belong in [data/](../../data/README.md); API DTOs belong in [contracts](../contracts/README.md). Stage 2.11 stores pack ownership, versioned attempt snapshots, fractional scores and mock rules here. Adding a pack using supported formats needs no schema change.

## Apply migrations and rebuild Prisma Client

Run from the repository root with PostgreSQL running and `DATABASE_URL` configured for the intended database. Migration and seed scripts use the local development database URL when that variable is absent.

```bash
pnpm db:migrate:deploy
pnpm --filter @exam-one/database build
pnpm db:seed
```

`build` validates the schema, regenerates Prisma Client and compiles the package. It does not apply migrations. `db:seed` upserts bundled catalog content while preserving user-owned content. In a fresh workspace, build workspace dependencies first with `pnpm build` before invoking seed code.

For client generation alone, use `pnpm --filter @exam-one/database db:generate`. After intentionally changing the schema in development, create a new migration with `pnpm db:migrate`. Preserve applied migrations and SQL partial unique indexes. See the [backup/recovery and rehearsal guide](../../data/VERIFICATION.md), [partial-index standard](../../agent-os/standards/database/partial-unique-indexes.md) and [seed-upsert standard](../../agent-os/standards/database/seed-upsert-overlay.md).

## Checks

```bash
pnpm --filter @exam-one/database db:validate
pnpm --filter @exam-one/database type-check
pnpm --filter @exam-one/database lint
```

The package's `test` script validates the Prisma schema; backend integration tests and migration rehearsal scripts verify database behavior. Edit source/schema/migration files; Prisma Client and `dist/` are generated artifacts.
