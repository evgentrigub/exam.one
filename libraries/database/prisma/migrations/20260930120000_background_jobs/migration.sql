CREATE TYPE "BackgroundJobType" AS ENUM ('LISTENING_AUDIO', 'EXERCISE_GENERATION', 'MOCK_EXAM_SET');
CREATE TYPE "BackgroundJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'CANCEL_REQUESTED', 'COMPLETED', 'FAILED', 'CANCELLED');

ALTER TABLE "Setting" ADD COLUMN "notifyMockReadyEmail" BOOLEAN NOT NULL DEFAULT true;

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

CREATE UNIQUE INDEX "BackgroundJob_activeKey_key" ON "BackgroundJob"("activeKey");
CREATE INDEX "BackgroundJob_userId_createdAt_idx" ON "BackgroundJob"("userId", "createdAt" DESC);
CREATE INDEX "BackgroundJob_userId_status_idx" ON "BackgroundJob"("userId", "status");
ALTER TABLE "BackgroundJob" ADD CONSTRAINT "BackgroundJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
