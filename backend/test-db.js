const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const convs = await prisma.conversation.findMany();
  console.log('Conversations:', convs);
  const msgs = await prisma.conversationMessage.findMany();
  console.log('Messages:', msgs);
}
run();
