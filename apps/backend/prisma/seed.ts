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

    // Create sample services for each company
    const services = [
      {
        name: 'Corte de Cabelo',
        description: 'Corte de cabelo masculino',
        price: 25.00,
        duration: 30,
        category: 'Cabelo',
      },
      {
        name: 'Barba',
        description: 'Aparar e modelar barba',
        price: 15.00,
        duration: 20,
        category: 'Barba',
      },
      {
        name: 'Corte + Barba',
        description: 'Corte de cabelo e barba',
        price: 35.00,
        duration: 45,
        category: 'Combo',
      },
    ];

    const createdServices = [];
    for (const serviceData of services) {
      const service = await prisma.service.create({
        data: {
          ...serviceData,
          companyId: company.id,
        },
      });
      createdServices.push(service);
    }
    console.log(`✅ Services created for ${company.name}:`, createdServices.length);

    // Create sample professionals for each company
    const professionals = [
      {
        name: `João Silva - ${company.name}`,
        email: `joao${companyNum}@${company.slug}.com`,
        phone: '(11) 99999-0001',
        commission: 50.00,
      },
      {
        name: `Maria Santos - ${company.name}`,
        email: `maria${companyNum}@${company.slug}.com`,
        phone: '(11) 99999-0002',
        commission: 45.00,
      },
    ];

    const createdProfessionals = [];
    for (const professionalData of professionals) {
      const professional = await prisma.professional.create({
        data: {
          ...professionalData,
          companyId: company.id,
        },
      });
      createdProfessionals.push(professional);
    }
    console.log(`✅ Professionals created for ${company.name}:`, createdProfessionals.length);

    // Create sample appointments for each company
    const now = new Date();
    const appointments = [
      {
        clientName: 'Cliente 1',
        clientPhone: '(11) 99999-1001',
        clientEmail: 'cliente1@email.com',
        startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        endTime: new Date(now.getTime() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // Tomorrow + 30min
        status: 'PENDING',
        serviceId: createdServices[0].id,
        professionalId: createdProfessionals[0].id,
      },
      {
        clientName: 'Cliente 2',
        clientPhone: '(11) 99999-1002',
        clientEmail: 'cliente2@email.com',
        startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        endTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000), // Day after tomorrow + 20min
        status: 'CONFIRMED',
        serviceId: createdServices[1].id,
        professionalId: createdProfessionals[1].id,
      },
      {
        clientName: 'Cliente 3',
        clientPhone: '(11) 99999-1003',
        clientEmail: 'cliente3@email.com',
        startTime: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Yesterday
        endTime: new Date(now.getTime() - 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // Yesterday + 45min
        status: 'COMPLETED',
        serviceId: createdServices[2].id,
        professionalId: createdProfessionals[0].id,
      },
      {
        clientName: 'Cliente 4',
        clientPhone: '(11) 99999-1004',
        clientEmail: 'cliente4@email.com',
        startTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        endTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // 2 days ago + 30min
        status: 'CANCELLED',
        serviceId: createdServices[0].id,
        professionalId: createdProfessionals[1].id,
      },
    ];

    for (const appointmentData of appointments) {
      await prisma.appointment.create({
        data: {
          ...appointmentData,
          companyId: company.id,
        },
      });
    }
    console.log(`✅ Appointments created for ${company.name}:`, appointments.length);
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
