"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/adminRoutes.js
const express_1 = __importDefault(require("express"));
const adminController_js_1 = require("../controllers/adminController.js");
const auth_js_1 = require("../middleware/auth.js");
const database_js_1 = __importDefault(require("../config/database.js"));
const router = express_1.default.Router();
router.get('/login', adminController_js_1.showLogin);
router.post('/login', adminController_js_1.handleLogin);
router.get('/logout', adminController_js_1.handleLogout);
router.get('/dashboard', auth_js_1.isAuthenticated, adminController_js_1.showDashboard);
router.get('/ticker', auth_js_1.isAuthenticated, adminController_js_1.showTickerSettings);
router.post('/ticker/save', auth_js_1.isAuthenticated, adminController_js_1.saveTickerSettings);
router.get('/edit/jam/:id', auth_js_1.isAuthenticated, adminController_js_1.showEditJam);
router.post('/edit/jam/:id', auth_js_1.isAuthenticated, adminController_js_1.updateJam);
router.get('/edit/learn/:id', auth_js_1.isAuthenticated, adminController_js_1.showEditLearn);
router.post('/edit/learn/:id', auth_js_1.isAuthenticated, adminController_js_1.updateLearn);
router.get('/edit/band/:id', auth_js_1.isAuthenticated, adminController_js_1.showEditBand);
router.post('/edit/band/:id', auth_js_1.isAuthenticated, adminController_js_1.updateBand);
router.get('/edit/festival/:id', auth_js_1.isAuthenticated, adminController_js_1.showEditFestival);
router.post('/edit/festival/:id', auth_js_1.isAuthenticated, adminController_js_1.updateFestival);
router.get('/edit/concert/:id', auth_js_1.isAuthenticated, adminController_js_1.showEditConcert);
router.post('/edit/concert/:id', auth_js_1.isAuthenticated, adminController_js_1.updateConcert);
router.post('/approve/:type/:id', auth_js_1.isAuthenticated, adminController_js_1.approveItem);
router.post('/delete/:type/:id', auth_js_1.isAuthenticated, adminController_js_1.deleteItem);
router.get('/submissions', auth_js_1.isAuthenticated, adminController_js_1.showSubmissions);
router.get('/submissions/:id', auth_js_1.isAuthenticated, adminController_js_1.showSubmissionDetail);
router.post('/submissions/:id/status', auth_js_1.isAuthenticated, adminController_js_1.updateSubmissionStatus);
router.get('/links', auth_js_1.isAuthenticated, async (req, res) => {
    try {
        const [links] = await database_js_1.default.query('SELECT id, Slug, TargetURL, ClickCount, CreatedAt FROM ShortLinks ORDER BY CreatedAt DESC');
        res.render('admin/links', {
            title: 'Short Link Manager',
            username: req.session.username,
            links,
            success: req.query.success === '1',
            error: req.query.error || null,
            baseUrl: `${req.protocol}://${req.get('host')}`
        });
    }
    catch (err) {
        console.error('Error loading short links:', err);
        res.status(500).render('500', { message: 'Server error' });
    }
});
router.post('/links', auth_js_1.isAuthenticated, async (req, res) => {
    const slug = (req.body.slug || '').trim();
    const targetURL = (req.body.targetURL || '').trim();
    if (!slug) {
        return res.redirect('/admin/links?error=' + encodeURIComponent('Slug is required.'));
    }
    if (!targetURL) {
        return res.redirect('/admin/links?error=' + encodeURIComponent('Target URL is required.'));
    }
    try {
        await database_js_1.default.query('INSERT INTO ShortLinks (Slug, TargetURL) VALUES (?, ?)', [slug, targetURL]);
        return res.redirect('/admin/links?success=1');
    }
    catch (err) {
        if (err && err.code === 'ER_DUP_ENTRY') {
            return res.redirect('/admin/links?error=' + encodeURIComponent('That slug already exists.'));
        }
        console.error('Error creating short link:', err);
        return res.redirect('/admin/links?error=' + encodeURIComponent('Unable to create link.'));
    }
});
router.post('/links/delete/:id', auth_js_1.isAuthenticated, async (req, res) => {
    try {
        await database_js_1.default.query('DELETE FROM ShortLinks WHERE id = ?', [req.params.id]);
    }
    catch (err) {
        console.error('Error deleting short link:', err);
    }
    res.redirect('/admin/links');
});
router.post('/links/edit/:id', auth_js_1.isAuthenticated, async (req, res) => {
    const { targetURL } = req.body;
    if (!targetURL || !targetURL.trim()) {
        return res.redirect('/admin/links?error=' + encodeURIComponent('Target URL is required.'));
    }
    try {
        await database_js_1.default.query('UPDATE ShortLinks SET TargetURL = ? WHERE id = ?', [targetURL.trim(), req.params.id]);
        return res.redirect('/admin/links?success=updated');
    }
    catch (err) {
        console.error('Error updating short link:', err);
        return res.redirect('/admin/links?error=' + encodeURIComponent('Unable to update link.'));
    }
});
exports.default = router;
