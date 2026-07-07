const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const business = await prisma.business.upsert({
    where: { slug: 'glow-beauty' },
    update: {},
    create: {
      name: 'Glow Beauty Salon',
      slug: 'glow-beauty',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@glowbeauty.com' },
    update: {},
    create: {
      email: 'admin@glowbeauty.com',
      name: 'Admin User',
      passwordHash: 'change-me',
      role: 'admin',
      businessId: business.id,
    },
  });

  console.log('Seeded initial salon and admin user');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
