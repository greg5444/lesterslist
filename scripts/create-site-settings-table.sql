-- Create SiteSettings table for admin-controlled site-wide settings
CREATE TABLE IF NOT EXISTS SiteSettings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'text',
  description VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(100)
);

-- Insert default ticker settings
INSERT INTO SiteSettings (setting_key, setting_value, setting_type, description) VALUES
('ticker_enabled', 'true', 'boolean', 'Enable/disable homepage ticker'),
('ticker_text', 'LIVE ON LESTERSLIST: {concertCount} Upcoming Concerts • {festivalCount} Major Festivals • {jamCount} Local Jams • {campCount} Camps & Workshops • Find Bluegrass Near You!', 'text', 'Homepage ticker content'),
('ticker_speed', 'medium', 'text', 'Ticker animation speed: slow, medium, or fast')
ON DUPLICATE KEY UPDATE setting_key=setting_key;
