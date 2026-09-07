# Seed Upsert and Overlay

`seedCatalog` upserts bundled rows (`source=seed`, `userId` null, `packId` set). It never deletes user-generated rows.

```
@@unique([userId, skill, packId, externalId])  // user overlay
```

Partial unique for seeds (SQL-only): `(source, packId, externalId) WHERE source = 'seed'`.

- List seed + the current user's rows for the **active pack**. Same `externalId` in that pack: user row wins.
- User APIs must not update or delete seed rows (`SEED_LOCKED`). `POST /exercises` with a seed `externalId` is `SEED_ID` — generated exercises need a new id.
- Exception: listening audio may copy-on-write a user-owned row with the same `externalId` (seed row stays untouched).
- Mock Set 1 is `generated: false`, `userId` null. User sets are `generated: true` and owned by `userId`.
