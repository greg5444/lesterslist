// Script to add Active column to Bands table
import pool from '../src/config/database.js';

async function addActiveColumn() {
  try {
    console.log('Adding Active column to Bands table...');
    
    // Add the Active column with default value of 1 (active)
    await pool.query(`
      ALTER TABLE Bands 
      ADD COLUMN Active TINYINT(1) NOT NULL DEFAULT 1 
      COMMENT 'Whether the band is active/visible on the site'
    `);
    
    console.log('✓ Active column added successfully');
    console.log('All existing bands are now marked as Active = 1');
    
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Active column already exists');
    } else {
      console.error('Error adding Active column:', error.message);
      throw error;
    }
  } finally {
    await pool.end();
  }
}

addActiveColumn();
