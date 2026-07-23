require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const bad = await prisma.patient.findMany({ where: { phone: 'null' } });
  for (const pt of bad) {
    const call = await prisma.call.findFirst({ where: { patientId: pt.id } });
    const phone = call?.phoneNumber || 'Unknown';
    await prisma.patient.update({ where: { id: pt.id }, data: { phone } });
    console.log('fixed', pt.id, phone);
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
