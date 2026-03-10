  import pool from '../config/database.js';

  export default class LocalJam {
    static async findById(JamID) {
      const [rows] = await pool.query(
        "SELECT JamID, JamName, VenueName, Schedule, AllWelcome, BeginnersWelcome, AdvancedOnly, ContactName, ContactEmail, ContactPhone, ShowPhone, City, State, Zip, GoogleMapAddress FROM LocalJams WHERE JamID = ? AND Status = 'Published' LIMIT 1",
        [JamID]
      );
      return rows[0] || null;
    }

  static async findPublishedFiltered(limit, offset, filters = {}) {
    let query = "SELECT JamID, JamName, VenueName, Schedule, AllWelcome, BeginnersWelcome, AdvancedOnly, ContactName, ContactEmail, ContactPhone, ShowPhone, City, State, Zip, GoogleMapAddress FROM LocalJams WHERE Status = 'Published'";
    const params = [];

    if (filters.state) {
      query += " AND State = ?";
      params.push(filters.state);
    }

    query += " ORDER BY JamName ASC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async countPublishedFiltered(filters = {}) {
    let query = "SELECT COUNT(*) as total FROM LocalJams WHERE Status = 'Published'";
    const params = [];

    if (filters.state) {
      query += " AND State = ?";
      params.push(filters.state);
    }

    const [[{ total }]] = await pool.query(query, params);
    return total;
  }

  static async getFilterOptions() {
    const [states] = await pool.query(
      "SELECT DISTINCT State FROM LocalJams WHERE Status = 'Published' AND State != '' ORDER BY State"
    );
    return { states: states.map(s => s.State) };
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
