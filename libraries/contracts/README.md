# @exam-one/contracts

[Back to the application](../../README.md#project-structure)

Framework-neutral TypeScript API contracts shared by exam.one's Nuxt frontend and NestJS backend. The package expresses accounts, practice, jobs, mocks, media, and provider responses across languages and exams. It is an internal workspace package, with no running service.

## Contents

| Source                                           | Responsibility                                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| [src/index.ts](src/index.ts)                     | Public exports                                                                              |
| [src/api/response.ts](src/api/response.ts)       | Data/error envelopes                                                                        |
| [src/auth/types.ts](src/auth/types.ts)           | Registration, session, and account requests                                                 |
| [src/domain/](src/domain/)                       | Users/settings, exercises, attempts/results, drafts, mocks, background jobs, and media DTOs |
| [src/llm/types.ts](src/llm/types.ts)             | AI and speech transport types                                                               |
| [src/exam/difficulty.ts](src/exam/difficulty.ts) | Shared difficulty type; authoritative level belongs to the selected pack                    |

## Boundaries

Keep contracts independent of Vue, NestJS decorators, and Prisma. Include pack identity where the transport needs it, while keeping exam rules and prompt content in [data/](../../data/README.md). Persistence models belong in [database](../database/README.md).

```ts
import type { AttemptDto, ExerciseDto } from '@exam-one/contracts'
```

TypeScript types do not validate incoming JSON. When changing a contract, update the corresponding backend DTO validation, response mapper, consumers, and relevant tests. Shared job stages/progress helpers keep worker and Activity behavior aligned.

## Commands

Run from the application root:

```bash
pnpm --filter @exam-one/contracts build
pnpm --filter @exam-one/contracts type-check
pnpm --filter @exam-one/contracts lint
```

The package test script is a placeholder; API behavior is tested in the backend. Edit `src/`. Workspace consumers currently use source exports; `dist/` is generated output.
