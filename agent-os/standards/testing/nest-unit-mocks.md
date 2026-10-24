# Nest Unit Tests

Colocate `*.spec.ts` next to the unit. Mock Prisma — no Postgres.

```ts
{ provide: PrismaService, useValue: prisma }
const user = makeUser()
```

- Build the module with `Test.createTestingModule`.
- Factories live in `apps/backend/src/testing/fixtures.ts` (`makeUser`, `makeExercise`, `makeCookieResponse`, …). Frozen `NOW` date.
- Assert thrown REST errors on `code` (`expect(getResponse()).toEqual(expect.objectContaining({ code }))`), not message text.
- Do not copy a second set of User/Exercise literals when a fixture exists.
