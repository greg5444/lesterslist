// src/models/submissionModel.js
// Stores public resource submissions pending admin review
import pool from '../config/database.js';

// Ensure table exists on module load — creates if missing
async function ensureTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ResourceSubmissions (
        SubmissionId   INT AUTO_INCREMENT PRIMARY KEY,
        SubmissionType VARCHAR(50)  NOT NULL,
        SubmissionData JSON         NOT NULL,
        ContactName    VARCHAR(255),
        ContactEmail   VARCHAR(255),
        ContactPhone   VARCHAR(50),
        Status         VARCHAR(20)  NOT NULL DEFAULT 'Pending',
        SubmittedAt    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_type_status (SubmissionType, Status),
        INDEX idx_submitted (SubmittedAt)
      )
    `);
  } catch (err) {
    console.error('[Submission Model] Failed to create ResourceSubmissions table:', err.message);
  }
}

// Initialize table on module load
ensureTable();

export default class Submission {
  /**
   * Save a new public resource submission.
   * @param {string} type  - 'festival' | 'band' | 'camp' | 'venue' | 'photos'
   * @param {object} data  - all form fields (stored as JSON)
   * @param {string} contactName
   * @param {string} contactEmail
   * @param {string} contactPhone
   * @returns {number} insertId
   */
  static async create(type, data, contactName, contactEmail, contactPhone) {
    await ensureTable();
    const [result] = await pool.query(
      `INSERT INTO ResourceSubmissions
         (SubmissionType, SubmissionData, ContactName, ContactEmail, ContactPhone)
       VALUES (?, ?, ?, ?, ?)`,
      [type, JSON.stringify(data), contactName || null, contactEmail || null, contactPhone || null]
    );
    return result.insertId;
  }

  /** Fetch all pending submissions for the admin dashboard */
  static async findPending() {
    await ensureTable();
    const [rows] = await pool.query(
      `SELECT SubmissionId, SubmissionType, SubmissionData, ContactName, ContactEmail, ContactPhone, SubmittedAt
       FROM ResourceSubmissions
       WHERE Status = 'Pending'
       ORDER BY SubmittedAt DESC`
    );
    return rows;
  }
}
