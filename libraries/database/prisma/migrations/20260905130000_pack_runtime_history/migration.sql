-- Forward-only: preserve old payloads and recorded results.
ALTER TABLE "Setting" ALTER COLUMN "examLevel" DROP DEFAULT;
ALTER TABLE "Setting" ALTER COLUMN "examLevel" TYPE TEXT USING "examLevel"::text;
ALTER TABLE "Setting" ALTER COLUMN "examLevel" SET DEFAULT 'A2';
ALTER TABLE "Exercise" ALTER COLUMN "level" DROP DEFAULT;
ALTER TABLE "Exercise" ALTER COLUMN "level" TYPE TEXT USING "level"::text;
ALTER TABLE "Exercise" ALTER COLUMN "level" SET DEFAULT 'A2';
ALTER TABLE "Result" ALTER COLUMN "score" TYPE DOUBLE PRECISION;
ALTER TABLE "Result" ALTER COLUMN "maxScore" TYPE DOUBLE PRECISION;
ALTER TABLE "Attempt" ADD COLUMN "packId" TEXT NOT NULL DEFAULT 'legacy-history', ADD COLUMN "snapshot" JSONB;
ALTER TABLE "Draft" ADD COLUMN "packId" TEXT NOT NULL DEFAULT 'legacy-history';
ALTER TABLE "MockExamSet" ADD COLUMN "packId" TEXT NOT NULL DEFAULT 'legacy-history';
UPDATE "Exercise" SET "packId" = CASE
  WHEN "level" = 'C1' OR "payload"->>'difficulty' = 'C1' THEN 'goethe-de-c1'
  WHEN "level" = 'A2' OR "payload"->>'difficulty' = 'A2' THEN 'goethe-de-a2'
  ELSE 'legacy-history' END;
UPDATE "Attempt" a SET "packId" = e."packId", "snapshot" = jsonb_build_object('version', 0, 'payload', e."payload", 'packId', e."packId")
  FROM "Exercise" e WHERE a."exerciseId" = e."id";
UPDATE "Attempt" SET "packId" = CASE WHEN "answers"->>'difficulty' = 'C1' THEN 'goethe-de-c1' WHEN "answers"->>'difficulty' = 'A2' THEN 'goethe-de-a2' ELSE 'legacy-history' END WHERE "exerciseId" IS NULL;
UPDATE "Draft" d SET "packId" = e."packId" FROM "Exercise" e WHERE d."topicId" = e."externalId" AND d."skill" = e."skill" AND (e."userId" = d."userId" OR e."userId" IS NULL)
  AND NOT EXISTS (SELECT 1 FROM "Exercise" other WHERE other."externalId" = e."externalId" AND other."skill" = e."skill" AND (other."userId" = d."userId" OR other."userId" IS NULL) AND other."packId" <> e."packId");
UPDATE "MockExamSet" SET "packId" = CASE WHEN "examId" IN ('goethe-a2', 'goethe-de-a2') THEN 'goethe-de-a2' WHEN "examId" = 'goethe-de-c1' OR "level" = 'C1' THEN 'goethe-de-c1' ELSE 'legacy-history' END;
UPDATE "GenerationJob" SET "packId" = CASE WHEN "payload"->>'difficulty' = 'C1' THEN 'goethe-de-c1' WHEN "payload"->>'difficulty' = 'A2' THEN 'goethe-de-a2' ELSE 'legacy-history' END;
DROP INDEX "Draft_userId_skill_topicId_key";
CREATE UNIQUE INDEX "Draft_userId_packId_skill_topicId_key" ON "Draft"("userId", "packId", "skill", "topicId");
DROP INDEX "MockExamSet_userId_externalId_key";
CREATE UNIQUE INDEX "MockExamSet_userId_packId_externalId_key" ON "MockExamSet"("userId", "packId", "externalId");
DROP INDEX IF EXISTS "MockExamSet_seed_externalId_key";
CREATE UNIQUE INDEX "MockExamSet_seed_packId_externalId_key" ON "MockExamSet"("packId", "externalId") WHERE "userId" IS NULL AND "generated" = false;
CREATE INDEX "Attempt_userId_packId_skill_idx" ON "Attempt"("userId", "packId", "skill");
UPDATE "Setting" SET "packId" = 'goethe-de-a2', "examLevel" = 'A2', "targetLanguage" = 'de' WHERE "packId" <> 'goethe-de-a2';
