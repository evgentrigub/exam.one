# Frontend Tests

`apps/frontend` has no unit or e2e specs. `pnpm test` is a no-op there. Backend Jest is the automated gate.

- Do not add Vitest/Jest/Playwright suites unless the task is to add them.
- Playwright is already a dependency; do not add a second frontend test runner beside it.
- For UI/layout/routing changes, verify in the browser (or the closest substitute) before finishing.
- Do not skip `pnpm lint` / `pnpm type-check` because frontend tests are missing.
