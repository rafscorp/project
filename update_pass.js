const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.user.updateMany({
    data: { passwordHash: '$2b$12$IFG1npjoz3L1R2wCgdjkWO49j5AMjK4kSw2.xeBGaQHJspKBt3LSO' }
  });
  console.log('Updated passwords to kali');
}
main().catch(console.error).finally(() => prisma.$disconnect());
