# @exam-one/database

[Back to the application](../../README.md#project-structure)

PostgreSQL schema, migrations, Prisma Client, and bundled-content persistence for exam.one. This package stores the generic platform's accounts and practice records across registered exam packs.

## Contents

| Source                                             | Responsibility                                    |
| -------------------------------------------------- | ------------------------------------------------- |
| [prisma/schema.prisma](prisma/schema.prisma)       | Models, relations, indexes, and client generation |
| [prisma/migrations/](prisma/migrations/)           | Forward SQL migrations and partial unique indexes |
| [prisma/seed.ts](prisma/seed.ts)                   | Seed command entry point                          |
| [src/seed.ts](src/seed.ts)                         | Idempotent exercise and bundled mock-set upserts  |
| [src/client.ts](src/client.ts)                     | PostgreSQL adapter/client factory                 |
| [src/index.ts](src/index.ts)                       | Public model, client, and seed exports            |
| [scripts/set-password.ts](scripts/set-password.ts) | Local account password recovery                   |

## Ownership and seeds

Change this package for schema, relationships, indexes, migration, or seed-persistence work. Exam definitions, prompts, content, and grading belong in [exam packs](../../data/README.md); API transport types belong in [contracts](../contracts/README.md).

The seeder reads every registered pack's `seedExercises` and `bundledMockSet`. It carries the pack ID and CEFR into storage, keeps mock-only exercises separate, and preserves user-owned rows. A pack using supported interactions needs no schema or seeder edit.

Attempts retain rendering/rubric snapshots; results support fractional points. Mock definitions preserve their own rules. Background jobs persist state/checkpoints in PostgreSQL while BullMQ executes them through Redis.

[nestjs-libraries](../nestjs-libraries/README.md) provides the injectable database lifecycle used by the API.

## Setup and migrations

Run from the application root with the intended PostgreSQL instance running. Export `DATABASE_URL` for a custom database. CLI/client code falls back to `postgresql://exam_one:exam_one@localhost:5432/exam_one?schema=public`; it does not automatically load the app's root `.env` for migration/seed commands.

```bash
pnpm --filter @exam-one/exam-packs build
pnpm --filter @exam-one/database db:generate
pnpm db:migrate:deploy
pnpm db:seed
```

For a schema change in development, create a new migration with `pnpm db:migrate`. Preserve applied migrations and SQL-only indexes. `build` regenerates Prisma Client and compiles source; it does not apply migrations. The backend Docker entrypoint applies committed migrations and upserts bundled content on boot.

See the [backup/restore runbook](../../README.md#backup-restore-and-upgrades), [migration standard](../../agent-os/standards/database/migrations.md), [partial-index standard](../../agent-os/standards/database/partial-unique-indexes.md), and [seed-upsert standard](../../agent-os/standards/database/seed-upsert-overlay.md).

## Checks

```bash
pnpm --filter @exam-one/database build
pnpm --filter @exam-one/database db:validate
pnpm --filter @exam-one/database type-check
pnpm --filter @exam-one/database lint
```

The package's test script validates the schema. Backend unit tests use mocks; backend API integration tests require a real database. Edit source/schema/migration files; Prisma Client and `dist/` are generated artifacts.

## Resetting practice data

From the application root, `pnpm db:reset-practice` prunes practice records and then restores bundled content. It deletes attempts, results, drafts, generated exercises, and other practice data while preserving accounts, sessions, and settings. It is never part of installation or startup.

For lower-level pruning, including the optional `--pack` and `--force` arguments, use `pnpm --filter @exam-one/database db:prune`. The root exposes the combined reset workflow; standalone schema validation remains package-local and also runs through `pnpm test`.
