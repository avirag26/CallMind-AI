DO $$ BEGIN
  CREATE TYPE "CallStatus" AS ENUM ('RINGING', 'ANSWERED', 'MISSED', 'REJECTED', 'AI_ACTIVE', 'COMPLETED', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE "Call" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sid" TEXT,
  "status" "CallStatus" NOT NULL DEFAULT 'RINGING',
  "phoneNumber" TEXT,
  "patientName" TEXT,
  "duration" INTEGER,
  "startedAt" TIMESTAMP(3),
  "timeoutAt" TIMESTAMP(3),
  "patientId" TEXT,
  "doctorId" TEXT,
  "organizationId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
