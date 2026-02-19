"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLearn = listLearn;
exports.showLearnForm = showLearnForm;
exports.submitLearn = submitLearn;
// src/controllers/learnController.js
const learnResourceModel_js_1 = __importDefault(require("../models/learnResourceModel.js"));
const email_js_1 = require("../config/email.js");
async function listLearn(req, res) {
    try {
        const resources = await learnResourceModel_js_1.default.findPublished();
        res.render('learn/index', { title: 'Learn to Play', resources });
    }
    catch (err) {
        console.error('Learn resources error:', err.message);
        res.render('learn/index', { title: 'Learn to Play', resources: [] });
    }
}
function showLearnForm(req, res) {
    res.render('learn/new', { title: 'Submit a Resource', success: false, error: null });
}
async function submitLearn(req, res) {
    const { InstructorName, CourseDescription, ExternalLink } = req.body;
    // Validate required fields
    if (!InstructorName || !CourseDescription || !ExternalLink) {
        return res.render('learn/new', { title: 'Submit a Resource', success: false, error: 'All fields are required.' });
    }
    // Validate URL format
    try {
        new URL(ExternalLink);
    }
    catch (error) {
        return res.render('learn/new', { title: 'Submit a Resource', success: false, error: 'Please enter a valid URL.' });
    }
    try {
        // Save resource to database as Draft
        const resourceData = { InstructorName, CourseDescription, ExternalLink };
        await learnResourceModel_js_1.default.create(resourceData);
        // Send email notification to admin
        const emailResult = await (0, email_js_1.sendLearnNotification)(resourceData);
        if (!emailResult.success) {
            console.error('Email notification failed:', emailResult.error);
            // Still show success to user even if email fails
        }
        res.render('learn/new', { title: 'Submit a Resource', success: true, error: null });
    }
    catch (error) {
        console.error('Error submitting resource:', error);
        res.render('learn/new', { title: 'Submit a Resource', success: false, error: 'An error occurred. Please try again.' });
    }
}
