-- AlterTable
ALTER TABLE "Setting" ADD COLUMN "packId" TEXT NOT NULL DEFAULT 'goethe-de-a2';

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN "packId" TEXT NOT NULL DEFAULT 'goethe-de-a2';

-- AlterTable
ALTER TABLE "GenerationJob" ADD COLUMN "packId" TEXT NOT NULL DEFAULT 'goethe-de-a2';

-- Existing rows (including leftover C1 settings) share the live Goethe A2 pack.
UPDATE "Setting" SET "packId" = 'goethe-de-a2';
UPDATE "Setting" SET "examLevel" = 'A2' WHERE "examLevel" = 'C1';
UPDATE "Exercise" SET "packId" = 'goethe-de-a2';
UPDATE "GenerationJob" SET "packId" = 'goethe-de-a2';

DROP INDEX IF EXISTS "Exercise_userId_skill_externalId_key";
CREATE UNIQUE INDEX "Exercise_userId_skill_packId_externalId_key" ON "Exercise"("userId", "skill", "packId", "externalId");

DROP INDEX IF EXISTS "Exercise_skill_level_visibility_idx";
CREATE INDEX "Exercise_packId_skill_level_visibility_idx" ON "Exercise"("packId", "skill", "level", "visibility");

DROP INDEX IF EXISTS "Exercise_source_externalId_idx";
CREATE INDEX "Exercise_source_packId_externalId_idx" ON "Exercise"("source", "packId", "externalId");

DROP INDEX IF EXISTS "Exercise_seed_externalId_key";
CREATE UNIQUE INDEX "Exercise_seed_packId_externalId_key" ON "Exercise"("source", "packId", "externalId") WHERE "source" = 'seed';

DROP INDEX IF EXISTS "GenerationJob_userId_kind_key";
CREATE UNIQUE INDEX "GenerationJob_userId_packId_kind_key" ON "GenerationJob"("userId", "packId", "kind");
