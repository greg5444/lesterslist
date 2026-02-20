  import pool from '../config/database.js';

  export default class LocalJam {
    static async findById(JamID) {
      const [rows] = await pool.query(
        "SELECT JamID, JamName, VenueName, Schedule, AllWelcome, BeginnersWelcome, AdvancedOnly, ContactName, ContactEmail, ContactPhone, ShowPhone, City, State, Zip, GoogleMapAddress FROM LocalJams WHERE JamID = ? AND Status = 'Published' LIMIT 1",
        [JamID]
      );
      return rows[0] || null;
    }
  static async create({ JamName, VenueName, Schedule, AllWelcome, BeginnersWelcome, AdvancedOnly, ContactName, ContactEmail, ContactPhone, ShowPhone, City, State, Zip, GoogleMapAddress }) {
    const [result] = await pool.query(
      'INSERT INTO LocalJams (JamName, VenueName, Schedule, SkillLevel, AllWelcome, BeginnersWelcome, AdvancedOnly, ContactName, ContactEmail, ContactPhone, ShowPhone, City, State, Zip, GoogleMapAddress, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [JamName, VenueName, Schedule, '', AllWelcome ? 1 : 0, BeginnersWelcome ? 1 : 0, AdvancedOnly ? 1 : 0, ContactName, ContactEmail, ContactPhone, ShowPhone ? 1 : 0, City || '', State || '', Zip || '', GoogleMapAddress || '', 'Draft']
    );
    return result.insertId;
  }

  static async findPublished() {
    const [rows] = await pool.query(
      "SELECT JamID, JamName, VenueName, Schedule, AllWelcome, BeginnersWelcome, AdvancedOnly, ContactName, ContactEmail, ContactPhone, ShowPhone, City, State, Zip, GoogleMapAddress FROM LocalJams WHERE Status = 'Published' ORDER BY JamName"
    );
    return rows;
  }
}
