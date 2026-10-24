# Migrations

Schema changes go through Prisma migrations in `@exam-one/database`.

- Local: `pnpm db:migrate` (`prisma migrate dev`) against the dev Postgres.
- Docker boot: `migrate deploy`, then the seed CLI. Never run `migrate dev` in the image.
- Do not edit SQL in a migration that may already be applied. Add a new migration instead.
- Folder name is Prisma timestamp + snake_case (`20260818120000_practice_persistence`). Describe the change, not a ticket.
- Preserve the SQL-only partial unique indexes when altering `Exercise` / `MockExamSet`.
- Seed is upsert, not a migration. Do not put catalog content in SQL.
