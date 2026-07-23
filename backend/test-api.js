const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

async function test() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://callmind:callmindpassword@localhost:5433/callmind_db?schema=public';
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const calls = await prisma.call.findMany();
    console.log('Success:', calls);
  } catch (err) {
    console.error('Prisma Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}
test();
