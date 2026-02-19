// Script to check and update LocalJams table schema
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function updateSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Checking LocalJams table structure...');
    const [columns] = await connection.query('DESCRIBE LocalJams');
    console.log('\nCurrent columns:');
    columns.forEach(col => console.log(`  - ${col.Field} (${col.Type})`));

    const columnNames = columns.map(col => col.Field);

    // Check if new contact fields exist
    const needsUpdate = !columnNames.includes('ContactName') || 
                        !columnNames.includes('ContactEmail') || 
                        !columnNames.includes('ContactPhone') || 
                        !columnNames.includes('ShowPhone');

    if (needsUpdate) {
      console.log('\n🔧 Updating schema to add new contact fields...\n');
      
      // Add new columns if they don't exist
      if (!columnNames.includes('ContactName')) {
        await connection.query('ALTER TABLE LocalJams ADD COLUMN ContactName VARCHAR(100) AFTER Schedule');
        console.log('✅ Added ContactName column');
      }
      
      if (!columnNames.includes('ContactEmail')) {
        await connection.query('ALTER TABLE LocalJams ADD COLUMN ContactEmail VARCHAR(100) AFTER ContactName');
        console.log('✅ Added ContactEmail column');
      }
      
      if (!columnNames.includes('ContactPhone')) {
        await connection.query('ALTER TABLE LocalJams ADD COLUMN ContactPhone VARCHAR(20) AFTER ContactEmail');
        console.log('✅ Added ContactPhone column');
      }
      
      if (!columnNames.includes('ShowPhone')) {
        await connection.query('ALTER TABLE LocalJams ADD COLUMN ShowPhone TINYINT(1) DEFAULT 0 AFTER ContactPhone');
        console.log('✅ Added ShowPhone column');
      }
      
      // Migrate old ContactPerson data to ContactName if ContactPerson exists
      if (columnNames.includes('ContactPerson')) {
        await connection.query('UPDATE LocalJams SET ContactName = ContactPerson WHERE ContactName IS NULL OR ContactName = ""');
        console.log('✅ Migrated ContactPerson data to ContactName');
        
        // Optional: Drop old ContactPerson column after migration
        // await connection.query('ALTER TABLE LocalJams DROP COLUMN ContactPerson');
        // console.log('✅ Dropped old ContactPerson column');
      }
      
      console.log('\n✨ Schema update completed successfully!');
    } else {
      console.log('\n✅ Schema is already up to date!');
    }

    // Show final structure
    const [finalColumns] = await connection.query('DESCRIBE LocalJams');
    console.log('\nFinal table structure:');
    finalColumns.forEach(col => console.log(`  - ${col.Field} (${col.Type})`));

  } catch (error) {
    console.error('❌ Error updating schema:', error.message);
  } finally {
    await connection.end();
  }
}

updateSchema();
