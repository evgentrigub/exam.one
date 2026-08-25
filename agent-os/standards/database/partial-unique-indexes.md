# Partial Unique Indexes

These exist in migration SQL, not in `schema.prisma` (Prisma cannot express them). Do not drop them.

```sql
CREATE UNIQUE INDEX "Exercise_seed_externalId_key"
  ON "Exercise"("source", "externalId") WHERE "source" = 'seed';

CREATE UNIQUE INDEX "MockExamSet_seed_externalId_key"
  ON "MockExamSet"("externalId") WHERE "userId" IS NULL;
```

- One bundled seed per `externalId`, even with `userId` null (Postgres unique + NULL).
- If a migration rebuilds `Exercise` or `MockExamSet`, recreate both indexes in the same migration.
- Do not duplicate these as Prisma `@@unique` unless they match the same partial `WHERE`.
