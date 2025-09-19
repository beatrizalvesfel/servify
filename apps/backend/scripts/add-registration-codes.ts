import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function addRegistrationCodes() {
  try {
    console.log('🔄 Adding registration codes to existing companies...');
    
    const companies = await prisma.company.findMany({
      where: {
        registrationCode: null
      }
    });

    console.log(`Found ${companies.length} companies without registration codes`);

    for (const company of companies) {
      const registrationCode = randomBytes(8).toString('hex').toUpperCase();
      
      await prisma.company.update({
        where: { id: company.id },
        data: { registrationCode }
      });

      console.log(`✅ Added code ${registrationCode} to ${company.name}`);
    }

    console.log('🎉 All companies now have registration codes!');
  } catch (error) {
    console.error('❌ Error adding registration codes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addRegistrationCodes();
