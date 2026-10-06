-- New accounts start on Cambridge English A2 Key; existing rows keep their pack.
ALTER TABLE "Setting" ALTER COLUMN "packId" SET DEFAULT 'cambridge-en-a2';
ALTER TABLE "Setting" ALTER COLUMN "targetLanguage" SET DEFAULT 'en';

-- Preferred text-to-speech voice per language, chosen in Settings → Voice models.
ALTER TABLE "Setting" ADD COLUMN "defaultVoices" JSONB NOT NULL DEFAULT '{}';
