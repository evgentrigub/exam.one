# @exam-one/nestjs-libraries

[Back to the application](../../README.md#project-structure)

Shared NestJS infrastructure for exam.one's generic API. This internal workspace package supplies `PrismaModule` and `PrismaService`, reused by account, practice, mock, job, and media services across exam packs.

## Contents

| Source                                                                 | Responsibility                                                                |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [src/index.ts](src/index.ts)                                           | Public exports                                                                |
| [src/prisma/prisma.module.ts](src/prisma/prisma.module.ts)             | Global module providing/exporting PrismaService                               |
| [src/prisma/prisma.service.ts](src/prisma/prisma.service.ts)           | Prisma client lifecycle: connect on initialization, disconnect on destruction |
| [src/prisma/prisma.service.spec.ts](src/prisma/prisma.service.spec.ts) | Mocked lifecycle tests                                                        |

## Usage and boundaries

The backend's `CoreModule` imports `PrismaModule`. Feature services receive the shared connection through dependency injection:

```ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '@exam-one/nestjs-libraries'

@Injectable()
export class ExampleService {
  constructor(private readonly prisma: PrismaService) {}

  countUsers() {
    return this.prisma.user.count()
  }
}
```

Keep connection/lifecycle behavior here. Schema, migrations, client generation, and seeds belong in [database](../database/README.md); authorization, user/pack scoping, and business operations belong in `apps/backend/`. Exam definitions belong in [data/](../../data/README.md). Frontend consumers use API [contracts](../contracts/README.md).

## Commands

Run from the application root after building database dependencies:

```bash
pnpm --filter @exam-one/nestjs-libraries build
pnpm --filter @exam-one/nestjs-libraries type-check
pnpm --filter @exam-one/nestjs-libraries lint
pnpm --filter @exam-one/nestjs-libraries test
```

Tests verify lifecycle behavior with mocks, without a running database. Runtime imports use compiled `dist/`; edit `src/` and rebuild/restart the backend when required.
