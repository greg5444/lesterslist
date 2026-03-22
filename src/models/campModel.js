// src/models/campModel.js
// Data access for Camps/Workshops table and associations
import pool from '../config/database.js';

export default class Camp {
  /**
   * Fetch upcoming camps with filters + pagination
   */
  static async findUpcomingFiltered(limit, offset, { state, month, lat, lng, radius = 50 } = {}) {
    const conditions = ['EndDate >= CURDATE()'];
    const params = [];
    let orderBy = 'StartDate ASC';
    let distanceField = '';

    if (state) {
      conditions.push('State = ?');
      params.push(state);
    }
    if (month) {
      if (month === 'next-two-weeks') {
        conditions.push('StartDate <= DATE_ADD(CURDATE(), INTERVAL 14 DAY)');
      } else {
        conditions.push("DATE_FORMAT(StartDate, '%Y-%m') = ?");
        params.push(month);
      }
    }
    if (lat && lng) {
      distanceField = `, (
        3959 * acos(
          cos(radians(?)) * cos(radians(Latitude)) *
          cos(radians(Longitude) - radians(?)) +
          sin(radians(?)) * sin(radians(Latitude))
        )
      ) AS distance`;
      params.unshift(lat, lng, lat);
      conditions.push('Latitude IS NOT NULL AND Longitude IS NOT NULL');
      conditions.push('((3959 * acos(cos(radians(?)) * cos(radians(Latitude)) * cos(radians(Longitude) - radians(?)) + sin(radians(?)) * sin(radians(Latitude)))) <= ?)');
      params.push(lat, lng, lat, radius);
      orderBy = 'distance ASC, StartDate ASC';
    }

    const where = conditions.join(' AND ');
    const [rows] = await pool.query(`
      SELECT JDNumber, EventName, StartDate, EndDate, DateRange, Contact, ExternalURL, ImageURL,
             VenueName, Street, City, State, Zip, GoogleMapAddress ${distanceField}
      FROM Camps
      WHERE ${where}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);
    return rows;
  }

  static async countUpcomingFiltered({ state, month, lat, lng, radius = 50 } = {}) {
    const conditions = ['EndDate >= CURDATE()'];
    const params = [];
    if (state) { conditions.push('State = ?'); params.push(state); }
    if (month) {
      if (month === 'next-two-weeks') {
        conditions.push('StartDate <= DATE_ADD(CURDATE(), INTERVAL 14 DAY)');
      } else {
        conditions.push("DATE_FORMAT(StartDate, '%Y-%m') = ?");
        params.push(month);
      }
    }
    if (lat && lng) {
      conditions.push('Latitude IS NOT NULL AND Longitude IS NOT NULL');
      conditions.push('((3959 * acos(cos(radians(?)) * cos(radians(Latitude)) * cos(radians(Longitude) - radians(?)) + sin(radians(?)) * sin(radians(Latitude)))) <= ?)');
      params.push(lat, lng, lat, radius);
    }
    const [rows] = await pool.query(
      `SELECT COUNT(*) as total FROM Camps WHERE ${conditions.join(' AND ')}`,
      params
    );
    return rows[0].total;
  }

  static async getFilterOptions() {
    const [states] = await pool.query(`
      SELECT DISTINCT State FROM Camps
      WHERE EndDate >= CURDATE() AND State IS NOT NULL AND State != ''
      ORDER BY State ASC
    `);
    const [months] = await pool.query(`
      SELECT DISTINCT DATE_FORMAT(StartDate, '%Y-%m') as month,
                      DATE_FORMAT(StartDate, '%b %Y') as label
      FROM Camps WHERE EndDate >= CURDATE()
      ORDER BY month ASC
    `);
    return {
      states: states.map(r => r.State),
      months: months.map(r => ({ value: r.month, label: r.label }))
    };
  }

  /**
   * Fetch camp by JDNumber
   */
  static async findById(jdNumber) {
    if (!jdNumber) throw new Error('JDNumber is required');
    const [rows] = await pool.query(`
      SELECT JDNumber, EventName, StartDate, EndDate, DateRange, Contact, ExternalURL, ImageURL,
             VenueName, Street, City, State, Zip, GoogleMapAddress, ExtraDetail
      FROM Camps
      WHERE JDNumber = ?
      LIMIT 1
    `, [jdNumber]);
    return rows[0] || null;
  }
}
