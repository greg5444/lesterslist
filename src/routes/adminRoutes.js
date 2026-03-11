// src/routes/adminRoutes.js
import express from 'express';
import { showLogin, handleLogin, handleLogout, showDashboard, approveItem, deleteItem, showEditJam, updateJam, showEditLearn, updateLearn, showTickerSettings, saveTickerSettings, showSubmissions, showSubmissionDetail, updateSubmissionStatus, showEditBand, updateBand, showEditFestival, updateFestival, showEditConcert, updateConcert } from '../controllers/adminController.js';
import { isAuthenticated } from '../middleware/auth.js';
import pool from '../config/database.js';

const router = express.Router();

router.get('/login', showLogin);
router.post('/login', handleLogin);
router.get('/logout', handleLogout);
router.get('/dashboard', isAuthenticated, showDashboard);
router.get('/ticker', isAuthenticated, showTickerSettings);
router.post('/ticker/save', isAuthenticated, saveTickerSettings);
router.get('/edit/jam/:id', isAuthenticated, showEditJam);
router.post('/edit/jam/:id', isAuthenticated, updateJam);
router.get('/edit/learn/:id', isAuthenticated, showEditLearn);
router.post('/edit/learn/:id', isAuthenticated, updateLearn);
router.get('/edit/band/:id', isAuthenticated, showEditBand);
router.post('/edit/band/:id', isAuthenticated, updateBand);
router.get('/edit/festival/:id', isAuthenticated, showEditFestival);
router.post('/edit/festival/:id', isAuthenticated, updateFestival);
router.get('/edit/concert/:id', isAuthenticated, showEditConcert);
router.post('/edit/concert/:id', isAuthenticated, updateConcert);
router.post('/approve/:type/:id', isAuthenticated, approveItem);
router.post('/delete/:type/:id', isAuthenticated, deleteItem);

router.get('/submissions', isAuthenticated, showSubmissions);
router.get('/submissions/:id', isAuthenticated, showSubmissionDetail);
router.post('/submissions/:id/status', isAuthenticated, updateSubmissionStatus);

router.get('/links', isAuthenticated, async (req, res) => {
	try {
		const [links] = await pool.query(
			'SELECT id, Slug, TargetURL, ClickCount, CreatedAt FROM ShortLinks ORDER BY CreatedAt DESC'
		);

		res.render('admin/links', {
			title: 'Short Link Manager',
			username: req.session.username,
			links,
			success: req.query.success === '1',
			error: req.query.error || null,
			baseUrl: `${req.protocol}://${req.get('host')}`
		});
	} catch (err) {
		console.error('Error loading short links:', err);
		res.status(500).render('500', { message: 'Server error' });
	}
});

router.post('/links', isAuthenticated, async (req, res) => {
	const slug = (req.body.slug || '').trim();
	const targetURL = (req.body.targetURL || '').trim();

	if (!slug) {
		return res.redirect('/admin/links?error=' + encodeURIComponent('Slug is required.'));
	}

	if (!targetURL) {
		return res.redirect('/admin/links?error=' + encodeURIComponent('Target URL is required.'));
	}

	try {
		await pool.query(
			'INSERT INTO ShortLinks (Slug, TargetURL) VALUES (?, ?)',
			[slug, targetURL]
		);
		return res.redirect('/admin/links?success=1');
	} catch (err) {
		if (err && err.code === 'ER_DUP_ENTRY') {
			return res.redirect('/admin/links?error=' + encodeURIComponent('That slug already exists.'));
		}
		console.error('Error creating short link:', err);
		return res.redirect('/admin/links?error=' + encodeURIComponent('Unable to create link.'));
	}
});

router.post('/links/delete/:id', isAuthenticated, async (req, res) => {
	try {
		await pool.query('DELETE FROM ShortLinks WHERE id = ?', [req.params.id]);
	} catch (err) {
		console.error('Error deleting short link:', err);
	}
	res.redirect('/admin/links');
});

router.post('/links/edit/:id', isAuthenticated, async (req, res) => {
	const { targetURL } = req.body;
	if (!targetURL || !targetURL.trim()) {
		return res.redirect('/admin/links?error=' + encodeURIComponent('Target URL is required.'));
	}
	try {
		await pool.query('UPDATE ShortLinks SET TargetURL = ? WHERE id = ?', [targetURL.trim(), req.params.id]);
		return res.redirect('/admin/links?success=updated');
	} catch (err) {
		console.error('Error updating short link:', err);
		return res.redirect('/admin/links?error=' + encodeURIComponent('Unable to update link.'));
	}
});

export default router;
