ALTER TABLE "MockExamSet" ADD COLUMN "rules" JSONB;

-- Retain the original provisional Goethe arithmetic, including its 100-point display.
UPDATE "MockExamSet" SET "rules" = '{"maximumPoints":100,"passPoints":60}'::jsonb
WHERE "packId" = 'goethe-de-a2';

UPDATE "MockExamSet" AS stored SET "modules" = (
  SELECT jsonb_agg(CASE WHEN module->>'skill' = 'listening' AND jsonb_typeof(module->'exercises') = 'array'
    THEN jsonb_set(module, '{exercises}', (
      SELECT jsonb_agg(exercise || jsonb_build_object('replays', CASE WHEN exercise->>'part' IN ('1', '4') THEN 2 ELSE 1 END))
      FROM jsonb_array_elements(module->'exercises') AS exercise
    )) ELSE module END)
  FROM jsonb_array_elements(stored."modules") AS module
) WHERE "packId" = 'goethe-de-a2' AND jsonb_typeof("modules") = 'array' AND jsonb_array_length("modules") > 0;
