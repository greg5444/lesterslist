// Add jam level columns to LocalJams table
import pool from '../src/config/database.js';

async function addJamLevelColumns() {
  try {
    console.log('🔍 Adding jam level columns to LocalJams table...\n');
    
    await pool.query(`
      ALTER TABLE LocalJams 
      ADD COLUMN AllWelcome TINYINT(1) DEFAULT 0 AFTER Schedule,
      ADD COLUMN BeginnersWelcome TINYINT(1) DEFAULT 0 AFTER AllWelcome,
      ADD COLUMN AdvancedOnly TINYINT(1) DEFAULT 0 AFTER BeginnersWelcome
    `);
    
    console.log('✅ Successfully added columns:');
    console.log('   - AllWelcome');
    console.log('   - BeginnersWelcome');
    console.log('   - AdvancedOnly\n');
    
    // Show final structure
    const [columns] = await pool.query('DESCRIBE LocalJams');
    console.log('Updated table structure:');
    columns.forEach(col => console.log(`  - ${col.Field} (${col.Type})`));
    
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('✅ Columns already exist!\n');
      const [columns] = await pool.query('DESCRIBE LocalJams');
      console.log('Table structure:');
      columns.forEach(col => console.log(`  - ${col.Field} (${col.Type})`));
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await pool.end();
  }
}

addJamLevelColumns();
