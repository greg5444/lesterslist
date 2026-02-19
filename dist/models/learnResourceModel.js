"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/learnResourceModel.js
const database_js_1 = __importDefault(require("../config/database.js"));
class LearnResource {
    static async create({ InstructorName, CourseDescription, ExternalLink }) {
        const [result] = await database_js_1.default.query('INSERT INTO LearnResources (InstructorName, CourseDescription, ExternalLink, Status) VALUES (?, ?, ?, ?)', [InstructorName, CourseDescription, ExternalLink, 'Draft']);
        return result.insertId;
    }
    static async findPublished() {
        const [rows] = await database_js_1.default.query("SELECT InstructorName, CourseDescription, ExternalLink FROM LearnResources WHERE Status = 'Published' ORDER BY InstructorName");
        return rows;
    }
}
exports.default = LearnResource;
