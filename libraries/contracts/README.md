# @exam-one/contracts

[Back to the project README](../../README.md#project-structure)

Shared TypeScript API contracts used by the Nuxt frontend and NestJS backend. This internal workspace package keeps both applications aligned on request and response shapes; it does not run a server.

## Contents

| Path | Responsibility |
| --- | --- |
| [src/index.ts](src/index.ts) | Public exports |
| [src/api/response.ts](src/api/response.ts) | API data/error envelopes |
| [src/auth/types.ts](src/auth/types.ts) | Authentication, session and account request types |
| [src/domain/](src/domain/) | Users, settings, exercises, attempts/results, drafts, jobs and mock DTOs |
| [src/llm/types.ts](src/llm/types.ts) | AI and speech types |
| [src/exam/difficulty.ts](src/exam/difficulty.ts) | Compatibility difficulty alias; authoritative CEFR belongs to the pack |

## When to change it

Edit this package when an API field or shared transport shape changes. Stage 2.11 added pack identities, attempt snapshots and stored mock rules to the relevant contracts. Keep these types independent of Vue, NestJS and Prisma.

```ts
import type { AttemptDto, ExerciseDto } from '@exam-one/contracts'
```

TypeScript types do not validate incoming JSON at runtime. Update the corresponding NestJS DTO validation and response mapping when changing an API contract. Exam rules belong in [data/](../../data/README.md); database models belong in [database](../database/README.md).

## Commands

Run from the repository root after `pnpm install`:

```bash
pnpm --filter @exam-one/contracts build
pnpm --filter @exam-one/contracts type-check
pnpm --filter @exam-one/contracts lint
```

The package's `test` command is a placeholder. API behavior is tested in the backend. Edit `src/`; `dist/` is generated output, while the package entry currently exports TypeScript source for workspace consumers.
