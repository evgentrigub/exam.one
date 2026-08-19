-- CreateEnum
CREATE TYPE "ExerciseVisibility" AS ENUM ('PRACTICE', 'EXAM_ONLY');

-- CreateEnum
CREATE TYPE "GenerationJobStatus" AS ENUM ('IDLE', 'RUNNING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "migratedDomains" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN "userId" TEXT;
ALTER TABLE "Exercise" ADD COLUMN "visibility" "ExerciseVisibility" NOT NULL DEFAULT 'PRACTICE';

UPDATE "Exercise" SET "externalId" = "id" WHERE "externalId" IS NULL;
ALTER TABLE "Exercise" ALTER COLUMN "externalId" SET NOT NULL;

-- AlterIndex
DROP INDEX IF EXISTS "Exercise_skill_level_idx";
CREATE INDEX "Exercise_skill_level_visibility_idx" ON "Exercise"("skill", "level", "visibility");
CREATE INDEX "Exercise_userId_skill_idx" ON "Exercise"("userId", "skill");
CREATE INDEX "Exercise_source_externalId_idx" ON "Exercise"("source", "externalId");
CREATE UNIQUE INDEX "Exercise_userId_skill_externalId_key" ON "Exercise"("userId", "skill", "externalId");
CREATE UNIQUE INDEX "Exercise_seed_externalId_key" ON "Exercise"("source", "externalId") WHERE "source" = 'seed';

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "MockExamSet" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "externalId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "generated" BOOLEAN NOT NULL DEFAULT false,
    "content" JSONB NOT NULL,
    "modules" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MockExamSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockExamAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "state" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockExamAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenerationJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "Skill" NOT NULL,
    "status" "GenerationJobStatus" NOT NULL DEFAULT 'IDLE',
    "payload" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GenerationJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MockExamSet_userId_idx" ON "MockExamSet"("userId");
CREATE UNIQUE INDEX "MockExamSet_userId_externalId_key" ON "MockExamSet"("userId", "externalId");
CREATE UNIQUE INDEX "MockExamSet_seed_externalId_key" ON "MockExamSet"("externalId") WHERE "userId" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MockExamAttempt_userId_setId_key" ON "MockExamAttempt"("userId", "setId");

-- CreateIndex
CREATE UNIQUE INDEX "GenerationJob_userId_kind_key" ON "GenerationJob"("userId", "kind");

-- AddForeignKey
ALTER TABLE "MockExamSet" ADD CONSTRAINT "MockExamSet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockExamAttempt" ADD CONSTRAINT "MockExamAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockExamAttempt" ADD CONSTRAINT "MockExamAttempt_setId_fkey" FOREIGN KEY ("setId") REFERENCES "MockExamSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationJob" ADD CONSTRAINT "GenerationJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
