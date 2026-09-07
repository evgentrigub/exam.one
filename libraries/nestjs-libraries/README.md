# @exam-one/nestjs-libraries

[Back to the project README](../../README.md#project-structure)

Shared NestJS infrastructure. Currently this internal package supplies the global `PrismaModule` and injectable `PrismaService` used throughout the backend. It does not run another application or database server.

## Contents

| Path | Responsibility |
| --- | --- |
| [src/index.ts](src/index.ts) | Public exports |
| [src/prisma/prisma.module.ts](src/prisma/prisma.module.ts) | Global module providing and exporting PrismaService |
| [src/prisma/prisma.service.ts](src/prisma/prisma.service.ts) | Extends PrismaClient, connects on module initialization and disconnects on destruction |
| [src/prisma/prisma.service.spec.ts](src/prisma/prisma.service.spec.ts) | Service lifecycle tests |

## Usage and boundaries

The backend's root `AppModule` imports `PrismaModule`. Feature services then receive the shared service through NestJS dependency injection:

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

Change this package for shared connection lifecycle or NestJS database integration. Schema, migrations, generated model types and seeds belong in [database](../database/README.md), which this package depends on. Feature authorization and business operations belong in `apps/backend/`. The frontend uses API [contracts](../contracts/README.md) rather than this server infrastructure.

## Commands

Run from the repository root after installing workspace dependencies and building `@exam-one/database`:

```bash
pnpm --filter @exam-one/nestjs-libraries build
pnpm --filter @exam-one/nestjs-libraries type-check
pnpm --filter @exam-one/nestjs-libraries lint
pnpm --filter @exam-one/nestjs-libraries test
```

Tests cover connection lifecycle behavior with mocks; backend integration tests cover actual database operations. Edit `src/`; runtime imports use compiled `dist/` output. Restart/rebuild the backend as appropriate after changing this package.
