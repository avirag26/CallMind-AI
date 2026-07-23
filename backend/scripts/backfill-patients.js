/**
 * One-off: create patients from conversation summaries and link calls.
 * Run: node scripts/backfill-patients.js
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const summaries = await prisma.conversationSummary.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      conversation: {
        include: { call: true },
      },
    },
  });

  let created = 0;
  let linked = 0;

  for (const summary of summaries) {
    const call = summary.conversation?.call;
    if (!call) continue;

    const patientName = summary.patientName || call.patientName;
    if (!patientName) continue;

    const names = patientName.trim().split(/\s+/);
    const firstName = names[0];
    const lastName = names.slice(1).join(' ') || '';
    const phone = summary.phone || call.phoneNumber || 'Unknown';
    const orgId = call.organizationId;

    let patient = await prisma.patient.findFirst({
      where: {
        phone,
        ...(orgId ? { organizationId: orgId } : { organizationId: null }),
      },
    });

    if (!patient) {
      patient = await prisma.patient.create({
        data: {
          firstName,
          lastName,
          phone,
          organizationId: orgId ?? undefined,
        },
      });
      created++;
    }

    if (call.patientId !== patient.id) {
      await prisma.call.update({
        where: { id: call.id },
        data: { patientId: patient.id, patientName },
      });
      linked++;
    }
  }

  console.log(JSON.stringify({ summaries: summaries.length, created, linked }));
  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
