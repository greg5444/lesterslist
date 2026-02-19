// src/controllers/learnController.js
import LearnResource from '../models/learnResourceModel.js';
import { sendLearnNotification } from '../config/email.js';
export async function listLearn(req, res) {
    try {
        const resources = await LearnResource.findPublished();
        res.render('learn/index', { title: 'Learn to Play', resources });
    }
    catch (err) {
        console.error('Learn resources error:', err.message);
        res.render('learn/index', { title: 'Learn to Play', resources: [] });
    }
}
export function showLearnForm(req, res) {
    res.render('learn/new', { title: 'Submit a Resource', success: false, error: null });
}
export async function submitLearn(req, res) {
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
        await LearnResource.create(resourceData);
        // Send email notification to admin
        const emailResult = await sendLearnNotification(resourceData);
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
