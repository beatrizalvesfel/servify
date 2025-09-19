import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listCompanyCodes() {
  try {
    console.log('🏢 Company Registration Codes:');
    console.log('================================');
    
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        registrationCode: true,
        slug: true,
      }
    });

    companies.forEach((company, index) => {
      console.log(`${index + 1}. ${company.name}`);
      console.log(`   Code: ${company.registrationCode}`);
      console.log(`   Slug: ${company.slug}`);
      console.log('');
    });

    console.log(`Total: ${companies.length} companies`);
  } catch (error) {
    console.error('❌ Error listing company codes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listCompanyCodes();
