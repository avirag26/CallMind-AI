const { Client } = require('pg');

async function init() {
  const client = new Client({
    connectionString: 'postgresql://callmind:callmindpassword@localhost:5433/callmind_db?schema=public'
  });
  
  try {
    await client.connect();
    console.log('Connected to DB');

    // Drop table if exists to recreate properly for the new schema
    await client.query(`DROP TABLE IF EXISTS "CallTimeline" CASCADE`);
    await client.query(`DROP TABLE IF EXISTS "CallStatusHistory" CASCADE`);
    await client.query(`DROP TABLE IF EXISTS "ConversationMessage" CASCADE`);
    await client.query(`DROP TABLE IF EXISTS "Conversation" CASCADE`);
    await client.query(`DROP TABLE IF EXISTS "Call" CASCADE`);

    // Create Enum
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "CallStatus" AS ENUM ('RINGING', 'ANSWERED', 'MISSED', 'REJECTED', 'AI_ACTIVE', 'COMPLETED', 'FAILED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create Call table
    await client.query(`
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
      )
    `);

    console.log('Tables created successfully!');
  } catch(e) {
    console.error('Error creating tables:', e);
  } finally {
    await client.end();
  }
}
init();
