# Database Package Ownership

`@exam-one/database` owns `prisma/schema.prisma`, `prisma/migrations/`, and `seedCatalog`. One schema for Nest, seed CLI, and Docker — do not add a second Prisma schema or client package.

- Nest injects `PrismaService` from `@exam-one/nestjs-libraries` (wraps this client). Do not `new PrismaClient()` inside `apps/backend`.
- Frontend must not import `@exam-one/database` or `@prisma/client`.
- Workspace scripts may open a client with `createPrismaClient()` from this package (seed, `auth:set-password`, one-off CLIs).
- Re-export the generated client and `createPrismaClient()` from `@exam-one/database`. Instantiation always goes through the PostgreSQL driver adapter.
