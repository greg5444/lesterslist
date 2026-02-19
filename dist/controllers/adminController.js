"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showLogin = showLogin;
exports.handleLogin = handleLogin;
exports.handleLogout = handleLogout;
exports.showDashboard = showDashboard;
exports.approveItem = approveItem;
exports.deleteItem = deleteItem;
exports.showEditJam = showEditJam;
exports.updateJam = updateJam;
exports.showEditLearn = showEditLearn;
exports.updateLearn = updateLearn;
exports.showTickerSettings = showTickerSettings;
exports.saveTickerSettings = saveTickerSettings;
// src/controllers/adminController.js
const userModel_js_1 = __importDefault(require("../models/userModel.js"));
const siteSettingsModel_js_1 = __importDefault(require("../models/siteSettingsModel.js"));
const database_js_1 = __importDefault(require("../config/database.js"));
function showLogin(req, res) {
    res.render('admin/login', { title: 'Admin Login', error: null });
}
async function handleLogin(req, res) {
    const { username, password } = req.body;
    const user = await userModel_js_1.default.findByUsername(username);
    if (!user || !(await userModel_js_1.default.verifyPassword(password, user.PasswordHash))) {
        return res.render('admin/login', { title: 'Admin Login', error: 'Invalid credentials' });
    }
    req.session.userId = user.UserID;
    req.session.username = user.Name || user.Email;
    res.redirect('/admin/dashboard');
}
function handleLogout(req, res) {
    req.session.destroy(() => {
        res.redirect('/admin/login');
    });
}
async function showDashboard(req, res) {
    try {
        // Approval Queue: Draft Jams
        const [draftJams] = await database_js_1.default.query("SELECT JamID, JamName, VenueName, Schedule, AllWelcome, BeginnersWelcome, AdvancedOnly, ContactName, ContactEmail, ContactPhone, ShowPhone, City, State FROM LocalJams WHERE Status = 'Draft' ORDER BY JamID DESC");
        // Approval Queue: Draft Learn Resources
        const [draftLearn] = await database_js_1.default.query("SELECT id, InstructorName, CourseDescription, ExternalLink FROM LearnResources WHERE Status = 'Draft' ORDER BY id DESC");
        // Quick Stats
        const [bandCount] = await database_js_1.default.query('SELECT COUNT(*) as total FROM Bands');
        const [concertCount] = await database_js_1.default.query('SELECT COUNT(*) as total FROM Concerts');
        const [festivalCount] = await database_js_1.default.query('SELECT COUNT(*) as total FROM Festivals');
        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            username: req.session.username,
            draftJams,
            draftLearn,
            stats: {
                bands: bandCount[0].total,
                concerts: concertCount[0].total,
                festivals: festivalCount[0].total
            }
        });
    }
    catch (err) {
        console.error('Error loading dashboard:', err);
        res.status(500).render('500', { message: 'Server error' });
    }
}
async function approveItem(req, res) {
    const { type, id } = req.params;
    if (type === 'jam') {
        await database_js_1.default.query(`UPDATE LocalJams SET Status = 'Published' WHERE JamID = ?`, [id]);
    }
    else {
        await database_js_1.default.query(`UPDATE LearnResources SET Status = 'Published' WHERE id = ?`, [id]);
    }
    res.redirect('/admin/dashboard');
}
async function deleteItem(req, res) {
    const { type, id } = req.params;
    if (type === 'jam') {
        await database_js_1.default.query(`DELETE FROM LocalJams WHERE JamID = ?`, [id]);
    }
    else {
        await database_js_1.default.query(`DELETE FROM LearnResources WHERE id = ?`, [id]);
    }
    res.redirect('/admin/dashboard');
}
async function showEditJam(req, res) {
    try {
        const { id } = req.params;
        const [jams] = await database_js_1.default.query('SELECT * FROM LocalJams WHERE JamID = ?', [id]);
        if (jams.length === 0) {
            return res.status(404).send('Jam not found');
        }
        res.render('admin/edit-jam', {
            title: 'Edit Jam',
            jam: jams[0],
            username: req.session.username
        });
    }
    catch (err) {
        console.error('Error loading jam for edit:', err);
        res.status(500).send('Server error');
    }
}
async function updateJam(req, res) {
    try {
        const { id } = req.params;
        const { JamName, VenueName, Schedule, AllWelcome, BeginnersWelcome, AdvancedOnly, ContactName, ContactEmail, ContactPhone, ShowPhone, City, State, Zip, GoogleMapAddress } = req.body;
        await database_js_1.default.query(`UPDATE LocalJams SET 
        JamName = ?, 
        VenueName = ?, 
        Schedule = ?, 
        AllWelcome = ?, 
        BeginnersWelcome = ?, 
        AdvancedOnly = ?, 
        ContactName = ?, 
        ContactEmail = ?, 
        ContactPhone = ?, 
        ShowPhone = ?, 
        City = ?, 
        State = ?, 
        Zip = ?, 
        GoogleMapAddress = ?
      WHERE JamID = ?`, [JamName, VenueName, Schedule, AllWelcome ? 1 : 0, BeginnersWelcome ? 1 : 0, AdvancedOnly ? 1 : 0, ContactName, ContactEmail, ContactPhone, ShowPhone ? 1 : 0, City, State, Zip, GoogleMapAddress, id]);
        res.redirect('/admin/dashboard');
    }
    catch (err) {
        console.error('Error updating jam:', err);
        res.status(500).send('Server error');
    }
}
async function showEditLearn(req, res) {
    try {
        const { id } = req.params;
        const [resources] = await database_js_1.default.query('SELECT * FROM LearnResources WHERE id = ?', [id]);
        if (resources.length === 0) {
            return res.status(404).send('Resource not found');
        }
        res.render('admin/edit-learn', {
            title: 'Edit Learning Resource',
            resource: resources[0],
            username: req.session.username
        });
    }
    catch (err) {
        console.error('Error loading resource for edit:', err);
        res.status(500).send('Server error');
    }
}
async function updateLearn(req, res) {
    try {
        const { id } = req.params;
        const { InstructorName, CourseDescription, ExternalLink } = req.body;
        await database_js_1.default.query(`UPDATE LearnResources SET 
        InstructorName = ?, 
        CourseDescription = ?, 
        ExternalLink = ?
      WHERE id = ?`, [InstructorName, CourseDescription, ExternalLink, id]);
        res.redirect('/admin/dashboard');
    }
    catch (err) {
        console.error('Error updating resource:', err);
        res.status(500).send('Server error');
    }
}
async function showTickerSettings(req, res) {
    try {
        const ticker = await siteSettingsModel_js_1.default.getTickerSettings();
        // Parse messages JSON if it exists
        let messages = [];
        if (ticker.ticker_text) {
            try {
                messages = JSON.parse(ticker.ticker_text);
            }
            catch (e) {
                // If not JSON, convert old format to new format
                messages = [{ text: ticker.ticker_text, url: '' }];
            }
        }
        res.render('admin/ticker-settings', {
            title: 'Ticker Settings',
            ticker: {
                enabled: ticker.ticker_enabled !== false,
                messages: messages,
                speed: ticker.ticker_speed || 'medium'
            },
            success: req.query.success === '1'
        });
    }
    catch (err) {
        console.error('Error loading ticker settings:', err);
        res.status(500).send('Server error');
    }
}
async function saveTickerSettings(req, res) {
    try {
        const { enabled, messages, speed } = req.body;
        const updatedBy = req.session.username || 'admin';
        // Build JSON array from the 6 rows
        const tickerMessages = [];
        if (messages) {
            for (let i = 0; i < 6; i++) {
                if (messages[i] && messages[i].text && messages[i].text.trim()) {
                    tickerMessages.push({
                        text: messages[i].text.trim(),
                        url: messages[i].url ? messages[i].url.trim() : ''
                    });
                }
            }
        }
        // Save as JSON string
        const jsonString = JSON.stringify(tickerMessages);
        await siteSettingsModel_js_1.default.saveTickerSettings(enabled === 'true', jsonString, speed || 'medium', updatedBy);
        res.redirect('/admin/ticker?success=1');
    }
    catch (err) {
        console.error('Error saving ticker settings:', err);
        res.status(500).send('Server error');
    }
}
