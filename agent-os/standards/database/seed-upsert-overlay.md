# Seed Upsert and Overlay

`seedCatalog` upserts bundled rows (`source=seed`, `userId` null). It never deletes user-generated rows.

```
@@unique([userId, skill, externalId])  // user overlay
```

- List seed + the current user's rows. Same `externalId`: user row wins.
- User APIs must not update or delete seed rows (`SEED_LOCKED`). `POST /exercises` with a seed `externalId` is `SEED_ID` — generated exercises need a new id.
- Exception: listening audio may copy-on-write a user-owned row with the same `externalId` (seed row stays untouched).
- Mock Set 1 is `generated: false`, `userId` null. User sets are `generated: true` and owned by `userId`.
