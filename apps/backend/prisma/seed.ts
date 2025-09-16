import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create multiple companies for multi-tenant testing
  const companies = [
    {
      name: 'Empresa Demo 1',
      slug: 'empresa1',
      domain: 'empresa1.localhost',
    },
    {
      name: 'Empresa Demo 2', 
      slug: 'empresa2',
      domain: 'empresa2.localhost',
    },
    {
      name: 'Empresa Demo 3',
      slug: 'empresa3', 
      domain: 'empresa3.localhost',
    },
    {
      name: 'Demo Company',
      slug: 'demo',
      domain: 'demo.localhost',
    },
    {
      name: 'Test Company',
      slug: 'test',
      domain: 'test.localhost',
    },
  ];

  const createdCompanies = [];
  
  for (const companyData of companies) {
    const company = await prisma.company.upsert({
      where: { slug: companyData.slug },
      update: {},
      create: {
        name: companyData.name,
        slug: companyData.slug,
        domain: companyData.domain,
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
    
    createdCompanies.push(company);
    console.log('✅ Company created:', company.name, `(${company.slug})`);
  }

  // Create users for each company
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  for (let i = 0; i < createdCompanies.length; i++) {
    const company = createdCompanies[i];
    const companyNum = i + 1;
    
    // Create admin user for each company
    const adminUser = await prisma.user.upsert({
      where: { email: `admin${companyNum}@servify.com.br` },
      update: {},
      create: {
        email: `admin${companyNum}@servify.com.br`,
        password: hashedPassword,
        firstName: `Admin`,
        lastName: `${company.name}`,
        role: 'ADMIN',
        isActive: true,
        companyId: company.id,
      },
    });

    console.log(`✅ Admin user created for ${company.name}:`, adminUser.email);

    // Create regular user for each company
    const regularUser = await prisma.user.upsert({
      where: { email: `user${companyNum}@servify.com.br` },
      update: {},
      create: {
        email: `user${companyNum}@servify.com.br`,
        password: hashedPassword,
        firstName: `User`,
        lastName: `${company.name}`,
        role: 'USER',
        isActive: true,
        companyId: company.id,
      },
    });

    console.log(`✅ Regular user created for ${company.name}:`, regularUser.email);
  }

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📋 Multi-tenant login credentials:');
  console.log('Empresa 1:');
  console.log('  Admin: admin1@servify.com.br / admin123');
  console.log('  User:  user1@servify.com.br / admin123');
  console.log('Empresa 2:');
  console.log('  Admin: admin2@servify.com.br / admin123');
  console.log('  User:  user2@servify.com.br / admin123');
  console.log('Empresa 3:');
  console.log('  Admin: admin3@servify.com.br / admin123');
  console.log('  User:  user3@servify.com.br / admin123');
  console.log('Demo:');
  console.log('  Admin: admin4@servify.com.br / admin123');
  console.log('  User:  user4@servify.com.br / admin123');
  console.log('Test:');
  console.log('  Admin: admin5@servify.com.br / admin123');
  console.log('  User:  user5@servify.com.br / admin123');
  console.log('\n🌐 Test URLs:');
  console.log('  Frontend: http://empresa1.localhost:3000');
  console.log('  Backend:  http://empresa1.localhost:3001/api/v1/companies');
  console.log('  Frontend: http://empresa2.localhost:3000');
  console.log('  Backend:  http://empresa2.localhost:3001/api/v1/companies');
  console.log('  Frontend: http://demo.localhost:3000');
  console.log('  Backend:  http://demo.localhost:3001/api/v1/companies');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
