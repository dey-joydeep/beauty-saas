const { PrismaClient } = require('@prisma/client');

async function checkTables() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking for SalonTenantStaff table...');
    const tenantStaff = await prisma.salonTenantStaff.findMany({ take: 1 });
    console.log('SalonTenantStaff table exists with', tenantStaff.length, 'records');
    
    console.log('Checking for SalonStaff table (should not exist)...');
    try {
      await prisma.$queryRaw`SELECT * FROM "SalonStaff" LIMIT 1`;
      console.log('WARNING: SalonStaff table still exists!');
    } catch (e) {
      console.log('SalonStaff table does not exist (expected)');
    }
    
    console.log('Checking foreign key constraints...');
    const fkCheck = await prisma.$queryRaw`
      SELECT
        tc.table_schema, 
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE 
        tc.constraint_type = 'FOREIGN KEY' 
        AND (ccu.table_name = 'salon_tenant_staff' OR ccu.table_name = 'salon_staff');
    `;
    
    console.log('Foreign key constraints involving staff tables:');
    console.log(fkCheck);
    
  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
