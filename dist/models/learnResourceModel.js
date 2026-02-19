// src/models/learnResourceModel.js
import pool from '../config/database.js';
export default class LearnResource {
    static async create({ InstructorName, CourseDescription, ExternalLink }) {
        const [result] = await pool.query('INSERT INTO LearnResources (InstructorName, CourseDescription, ExternalLink, Status) VALUES (?, ?, ?, ?)', [InstructorName, CourseDescription, ExternalLink, 'Draft']);
        return result.insertId;
    }
    static async findPublished() {
        const [rows] = await pool.query("SELECT InstructorName, CourseDescription, ExternalLink FROM LearnResources WHERE Status = 'Published' ORDER BY InstructorName");
        return rows;
    }
}
