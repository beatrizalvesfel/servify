import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default company
  const company = await prisma.company.upsert({
    where: { slug: 'servify-demo' },
    update: {},
    create: {
      name: 'Servify Demo',
      slug: 'servify-demo',
      domain: 'servify.com',
      logo: null,
      settings: {
        theme: 'light',
        features: {
          analytics: true,
          reports: true,
          integrations: true,
        },
      },
      isActive: true,
    },
  });

  console.log('✅ Company created:', company.name);

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@servify.com' },
    update: {},
    create: {
      email: 'admin@servify.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
      companyId: company.id,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'user@servify.com' },
    update: {},
    create: {
      email: 'user@servify.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
      role: 'USER',
      isActive: true,
      companyId: company.id,
    },
  });

  console.log('✅ Demo user created:', demoUser.email);

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('Admin: admin@servify.com / admin123');
  console.log('User:  user@servify.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
