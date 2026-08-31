-- CreateEnum
CREATE TYPE "PromptKind" AS ENUM ('GENERATOR', 'ANSWER', 'REVIEW');

-- CreateTable
CREATE TABLE "PromptOverride" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skill" "Skill" NOT NULL,
    "level" "ExamLevel" NOT NULL,
    "part" INTEGER NOT NULL,
    "kind" "PromptKind" NOT NULL,
    "body" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromptOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromptOverride_userId_skill_level_part_kind_key" ON "PromptOverride"("userId", "skill", "level", "part", "kind");

-- CreateIndex
CREATE INDEX "PromptOverride_userId_idx" ON "PromptOverride"("userId");

-- AddForeignKey
ALTER TABLE "PromptOverride" ADD CONSTRAINT "PromptOverride_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
