-- Create Conversation
CREATE TABLE IF NOT EXISTS "Conversation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "callId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Conversation_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Call" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create ConversationMessage
CREATE TABLE IF NOT EXISTS "ConversationMessage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "conversationId" TEXT NOT NULL,
  "speaker" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "provider" TEXT,
  "model" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ConversationMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create ConversationSummary
CREATE TABLE IF NOT EXISTS "ConversationSummary" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "conversationId" TEXT NOT NULL,
  "patientName" TEXT,
  "phone" TEXT,
  "age" TEXT,
  "gender" TEXT,
  "concern" TEXT,
  "symptoms" TEXT,
  "duration" TEXT,
  "urgency" TEXT,
  "preferredCallback" TEXT,
  "additionalNotes" TEXT,
  "shortSummary" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ConversationSummary_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create AIUsage
CREATE TABLE IF NOT EXISTS "AIUsage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "conversationId" TEXT NOT NULL,
  "messageId" TEXT,
  "promptTokens" INTEGER NOT NULL DEFAULT 0,
  "completionTokens" INTEGER NOT NULL DEFAULT 0,
  "totalTokens" INTEGER NOT NULL DEFAULT 0,
  "estimatedCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "provider" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AIUsage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "AIUsage_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ConversationMessage" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "AIUsage_messageId_key" ON "AIUsage"("messageId");

-- Create PromptTemplate
CREATE TABLE IF NOT EXISTS "PromptTemplate" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT false,
  "version" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "PromptTemplate_name_key" ON "PromptTemplate"("name");

-- Insert Emma Persona
INSERT INTO "PromptTemplate" ("id", "name", "content", "isActive", "version", "updatedAt")
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'Emma',
  'You are Emma. You are the AI receptionist for Cure & Wellness. Speak naturally. Be polite. Never diagnose diseases. Never provide medical advice. Only collect information. Always inform the caller that a doctor will return the call. Ask only one question at a time. Wait for the answer. Do not ask unnecessary questions. If enough information has been collected, finish politely. When you start the conversation, greet them by saying: "Hello. Thank you for calling Cure & Wellness. Our doctors are currently unavailable. One of our doctors will call you within approximately 10 minutes. May I ask you a few questions?". The questions you should collect are: Name, Age, Gender, City, Primary concern, Symptoms, Duration, Urgency, Previous consultation, Preferred callback time, Anything else to tell the doctor. Never ask questions already answered. Use conversation memory.',
  true,
  1,
  CURRENT_TIMESTAMP
) ON CONFLICT DO NOTHING;
