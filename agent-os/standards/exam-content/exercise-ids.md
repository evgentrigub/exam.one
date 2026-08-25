# Exercise IDs

Payload `id` is the catalog key. Prisma copies it to `externalId`. Do not use the row cuid as a public id.

```
reading-a2-teil1-001
writing-a2-teil2-001
mock-a2-set1-listening-teil3
```

- Practice: `{skill}-{level}-teil{n}-{seq}` (lowercase, hyphen, seq is 3 digits).
- Bundled mock Set 1: `mock-a2-set1-{skill}-teil{n}`.
- Nested question/item ids: `{exerciseId}-q{n}` or `{exerciseId}-{itemId}`.
- Generated exercises need a new id (never a seed id).
- Keep ids stable across seed reruns (overlay + listening audio paths).
