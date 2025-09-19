import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create 2 companies for multi-tenant testing
  const companies = [
    {
      name: 'Barbearia Central',
      slug: 'barbearia-central',
      domain: 'barbearia-central.localhost',
    },
    {
      name: 'Salão Elegance', 
      slug: 'salao-elegance',
      domain: 'salao-elegance.localhost',
    },
  ];

  const createdCompanies = [];
  
  for (const companyData of companies) {
    // Generate a 6-character registration code
    const registrationCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    // Set expiration to 7 days from now
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);
    
    const company = await prisma.company.upsert({
      where: { slug: companyData.slug },
      update: {},
      create: {
        name: companyData.name,
        slug: companyData.slug,
        domain: companyData.domain,
        logo: null,
        registrationCode: registrationCode,
        registrationCodeExpiresAt: expirationDate,
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
    console.log('✅ Company created:', company.name, `(${company.slug}) - Code: ${registrationCode} (expires: ${expirationDate.toLocaleDateString()})`);
  }

  // Create users for each company
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  for (let i = 0; i < createdCompanies.length; i++) {
    const company = createdCompanies[i];
    const companyNum = i + 1;
    
    // Create admin user for each company
    const adminUser = await prisma.user.upsert({
      where: { 
        email_companyId: {
          email: `admin${companyNum}@servify.com.br`,
          companyId: company.id
        }
      },
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
      where: { 
        email_companyId: {
          email: `user${companyNum}@servify.com.br`,
          companyId: company.id
        }
      },
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

      // Create user account for the professional
      await prisma.user.create({
        data: {
          email: professionalData.email,
          password: await bcrypt.hash('admin123', 10),
          firstName: professionalData.name.split(' ')[0],
          lastName: professionalData.name.split(' ').slice(1).join(' ') || '',
          role: 'USER',
          isActive: true,
          companyId: company.id,
          professionalId: professional.id, // Link user to professional
        },
      });
    }
    console.log(`✅ Professionals created for ${company.name}:`, createdProfessionals.length);

    // Create some professional-specific services
    if (createdProfessionals.length > 0) {
      const professionalServices = [
        {
          name: 'Corte Especializado',
          description: 'Corte especializado do João',
          price: 40.00,
          duration: 45,
          category: 'Especializado',
          professionalId: createdProfessionals[0].id,
        },
        {
          name: 'Tratamento Capilar',
          description: 'Tratamento especializado da Maria',
          price: 60.00,
          duration: 60,
          category: 'Tratamento',
          professionalId: createdProfessionals[1].id,
        },
      ];

      for (const serviceData of professionalServices) {
        await prisma.service.create({
          data: {
            ...serviceData,
            companyId: company.id,
          },
        });
      }
      console.log(`✅ Professional-specific services created for ${company.name}:`, professionalServices.length);
    }

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
          clientName: appointmentData.clientName,
          clientPhone: appointmentData.clientPhone,
          clientEmail: appointmentData.clientEmail,
          startTime: appointmentData.startTime,
          endTime: appointmentData.endTime,
          status: appointmentData.status as any,
          serviceId: appointmentData.serviceId,
          professionalId: appointmentData.professionalId,
          companyId: company.id,
        },
      });
    }
    console.log(`✅ Appointments created for ${company.name}:`, appointments.length);
  }

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📋 Multi-tenant login credentials:');
  console.log('Barbearia Central:');
  console.log('  Admin: admin1@servify.com.br / admin123');
  console.log('  User:  user1@servify.com.br / admin123');
  console.log('  Registration Code: XXXXXX (6 chars, expires in 7 days)');
  console.log('Salão Elegance:');
  console.log('  Admin: admin2@servify.com.br / admin123');
  console.log('  User:  user2@servify.com.br / admin123');
  console.log('  Registration Code: XXXXXX (6 chars, expires in 7 days)');
  console.log('\n🌐 Test URLs:');
  console.log('  Frontend: http://barbearia-central.localhost:3000');
  console.log('  Backend:  http://barbearia-central.localhost:3001/api/v1/companies');
  console.log('  Frontend: http://salao-elegance.localhost:3000');
  console.log('  Backend:  http://salao-elegance.localhost:3001/api/v1/companies');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
