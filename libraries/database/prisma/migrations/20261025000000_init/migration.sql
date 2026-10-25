-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Skill" AS ENUM ('READING', 'WRITING', 'LISTENING', 'SPEAKING', 'MOCK');

-- CreateEnum
CREATE TYPE "PlanId" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "ExamLevel" AS ENUM ('A2', 'C1');

-- CreateEnum
CREATE TYPE "AuthTokenType" AS ENUM ('EMAIL_VERIFY', 'PASSWORD_RESET', 'REFRESH');

-- CreateEnum
CREATE TYPE "ExerciseVisibility" AS ENUM ('PRACTICE', 'EXAM_ONLY');

-- CreateEnum
CREATE TYPE "BackgroundJobType" AS ENUM ('LISTENING_AUDIO', 'EXERCISE_GENERATION', 'MOCK_EXAM_SET');

-- CreateEnum
CREATE TYPE "BackgroundJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'CANCEL_REQUESTED', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PromptKind" AS ENUM ('GENERATOR', 'ANSWER', 'REVIEW');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "examTargetDate" TIMESTAMP(3),
    "plan" "PlanId" NOT NULL DEFAULT 'FREE',
    "passwordHash" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AuthTokenType" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packId" TEXT NOT NULL DEFAULT 'cambridge-en-a2',
    "examLevel" TEXT NOT NULL DEFAULT 'A2',
    "targetLanguage" TEXT NOT NULL DEFAULT 'en',
    "defaultVoices" JSONB NOT NULL DEFAULT '{}',
    "notifyMockReadyEmail" BOOLEAN NOT NULL DEFAULT true,
    "llmProvider" TEXT,
    "llmModel" TEXT,
    "llmFallbackModels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "llmReasoningEffort" TEXT NOT NULL DEFAULT 'medium',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LlmCredential" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "keyCiphertext" TEXT NOT NULL,
    "keyLast4" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LlmCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "packId" TEXT NOT NULL,
    "skill" "Skill" NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'A2',
    "source" TEXT NOT NULL DEFAULT 'seed',
    "visibility" "ExerciseVisibility" NOT NULL DEFAULT 'PRACTICE',
    "externalId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attempt" (
    "packId" TEXT NOT NULL,
    "snapshot" JSONB,
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT,
    "skill" "Skill" NOT NULL,
    "answers" JSONB NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "maxScore" DOUBLE PRECISION,
    "percentage" INTEGER,
    "review" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Draft" (
    "packId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skill" "Skill" NOT NULL DEFAULT 'WRITING',
    "topicId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Draft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockExamSet" (
    "packId" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "externalId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "generated" BOOLEAN NOT NULL DEFAULT false,
    "content" JSONB NOT NULL,
    "modules" JSONB NOT NULL,
    "rules" JSONB,
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
CREATE TABLE "BackgroundJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "type" "BackgroundJobType" NOT NULL,
    "status" "BackgroundJobStatus" NOT NULL DEFAULT 'QUEUED',
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "targetId" TEXT,
    "activeKey" TEXT,
    "input" JSONB NOT NULL,
    "progress" JSONB NOT NULL DEFAULT '{}',
    "checkpoint" JSONB NOT NULL DEFAULT '{}',
    "result" JSONB,
    "error" TEXT,
    "attempt" INTEGER NOT NULL DEFAULT 0,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "seenAt" TIMESTAMP(3),
    "emailAttemptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BackgroundJob_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "AuthToken_userId_type_idx" ON "AuthToken"("userId", "type");

-- CreateIndex
CREATE INDEX "AuthToken_tokenHash_idx" ON "AuthToken"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_userId_key" ON "Setting"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LlmCredential_userId_provider_key" ON "LlmCredential"("userId", "provider");

-- CreateIndex
CREATE INDEX "Exercise_packId_skill_level_visibility_idx" ON "Exercise"("packId", "skill", "level", "visibility");

-- CreateIndex
CREATE INDEX "Exercise_userId_skill_idx" ON "Exercise"("userId", "skill");

-- CreateIndex
CREATE INDEX "Exercise_source_packId_externalId_idx" ON "Exercise"("source", "packId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_userId_skill_packId_externalId_key" ON "Exercise"("userId", "skill", "packId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_seed_packId_externalId_key" ON "Exercise"("source", "packId", "externalId") WHERE ("source" = 'seed');

-- CreateIndex
CREATE INDEX "Attempt_userId_skill_idx" ON "Attempt"("userId", "skill");

-- CreateIndex
CREATE INDEX "Attempt_userId_packId_skill_idx" ON "Attempt"("userId", "packId", "skill");

-- CreateIndex
CREATE INDEX "Attempt_exerciseId_idx" ON "Attempt"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "Result_attemptId_key" ON "Result"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "Draft_userId_packId_skill_topicId_key" ON "Draft"("userId", "packId", "skill", "topicId");

-- CreateIndex
CREATE INDEX "MockExamSet_userId_idx" ON "MockExamSet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MockExamSet_userId_packId_externalId_key" ON "MockExamSet"("userId", "packId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "MockExamSet_seed_packId_externalId_key" ON "MockExamSet"("packId", "externalId") WHERE ("userId" IS NULL AND "generated" = false);

-- CreateIndex
CREATE UNIQUE INDEX "MockExamAttempt_userId_setId_key" ON "MockExamAttempt"("userId", "setId");

-- CreateIndex
CREATE UNIQUE INDEX "BackgroundJob_activeKey_key" ON "BackgroundJob"("activeKey");

-- CreateIndex
CREATE INDEX "BackgroundJob_userId_createdAt_idx" ON "BackgroundJob"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "BackgroundJob_userId_status_idx" ON "BackgroundJob"("userId", "status");

-- CreateIndex
CREATE INDEX "PromptOverride_userId_idx" ON "PromptOverride"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PromptOverride_userId_skill_level_part_kind_key" ON "PromptOverride"("userId", "skill", "level", "part", "kind");

-- AddForeignKey
ALTER TABLE "AuthToken" ADD CONSTRAINT "AuthToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting" ADD CONSTRAINT "Setting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LlmCredential" ADD CONSTRAINT "LlmCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draft" ADD CONSTRAINT "Draft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockExamSet" ADD CONSTRAINT "MockExamSet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockExamAttempt" ADD CONSTRAINT "MockExamAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockExamAttempt" ADD CONSTRAINT "MockExamAttempt_setId_fkey" FOREIGN KEY ("setId") REFERENCES "MockExamSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BackgroundJob" ADD CONSTRAINT "BackgroundJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromptOverride" ADD CONSTRAINT "PromptOverride_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

