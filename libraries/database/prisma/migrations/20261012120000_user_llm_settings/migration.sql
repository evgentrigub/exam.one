-- LLM provider, model and API key move from the server environment to each user's settings.
ALTER TABLE "Setting" ADD COLUMN "llmProvider" TEXT;
ALTER TABLE "Setting" ADD COLUMN "llmModel" TEXT;
ALTER TABLE "Setting" ADD COLUMN "llmFallbackModels" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Setting" ADD COLUMN "llmReasoningEffort" TEXT NOT NULL DEFAULT 'medium';

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

-- CreateIndex
CREATE UNIQUE INDEX "LlmCredential_userId_provider_key" ON "LlmCredential"("userId", "provider");

-- AddForeignKey
ALTER TABLE "LlmCredential" ADD CONSTRAINT "LlmCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
