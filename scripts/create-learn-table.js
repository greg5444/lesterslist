// Create LearnResources table
import pool from '../src/config/database.js';

async function createLearnResourcesTable() {
  try {
    console.log('🔍 Checking LearnResources table...\n');
    
    const [tables] = await pool.query("SHOW TABLES LIKE 'LearnResources'");
    
    if (tables.length === 0) {
      console.log('📝 Creating LearnResources table...');
      await pool.query(`
        CREATE TABLE LearnResources (
          id INT AUTO_INCREMENT PRIMARY KEY,
          InstructorName VARCHAR(255) NOT NULL,
          CourseDescription TEXT NOT NULL,
          ExternalLink VARCHAR(500) NOT NULL,
          Status VARCHAR(50) DEFAULT 'Draft',
          CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ LearnResources table created successfully!\n');
    } else {
      console.log('✅ LearnResources table already exists\n');
    }
    
    // Show table structure
    const [columns] = await pool.query('DESCRIBE LearnResources');
    console.log('Table structure:');
    columns.forEach(col => console.log(`  - ${col.Field} (${col.Type})`));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createLearnResourcesTable();
