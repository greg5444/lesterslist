// Script to create SiteSettings table
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function createSiteSettingsTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'lesterslist'
  });

  try {
    console.log('Creating SiteSettings table...');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS SiteSettings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT,
        setting_type VARCHAR(50) DEFAULT 'text',
        description VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        updated_by VARCHAR(100)
      )
    `);
    
    console.log('✓ SiteSettings table created');
    
    console.log('Inserting default ticker settings...');
    
    await connection.query(`
      INSERT INTO SiteSettings (setting_key, setting_value, setting_type, description) VALUES
      ('ticker_enabled', 'true', 'boolean', 'Enable/disable homepage ticker'),
      ('ticker_text', 'LIVE ON LESTERSLIST: {concertCount} Upcoming Concerts • {festivalCount} Major Festivals • {jamCount} Local Jams • {campCount} Camps & Workshops • Find Bluegrass Near You!', 'text', 'Homepage ticker content'),
      ('ticker_speed', 'medium', 'text', 'Ticker animation speed: slow, medium, or fast')
      ON DUPLICATE KEY UPDATE setting_key=setting_key
    `);
    
    console.log('✓ Default settings inserted');
    console.log('✓ Setup complete!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

createSiteSettingsTable();
