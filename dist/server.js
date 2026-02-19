// src/server.js
import express from 'express';
import session from 'express-session';
import engine from 'ejs-mate';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import bandRoutes from './routes/bandRoutes.js';
import venueRoutes from './routes/venueRoutes.js';
import concertRoutes from './routes/concertRoutes.js';
import festivalRoutes from './routes/festivalRoutes.js';
import campRoutes from './routes/campRoutes.js';
import jamRoutes from './routes/jamRoutes.js';
import learnRoutes from './routes/learnRoutes.js';
import mapRoutes from './routes/mapRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import homeRoutes from './routes/homeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import pool from './config/database.js';
// Load env vars
dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 3000;
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../src/public')));
// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));
// EJS setup
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../src/views'));
// Homepage route (must be first)
app.use('/', homeRoutes);
// Admin routes
app.use('/admin', adminRoutes);
// Band routes
app.use('/bands', bandRoutes);
// Venue routes
app.use('/venues', venueRoutes);
// Concert routes
app.use('/concerts', concertRoutes);
// Festival routes
app.use('/festivals', festivalRoutes);
// Camp routes
app.use('/camps', campRoutes);
// Jam routes
app.use('/jams', jamRoutes);
// Learn routes
app.use('/learn', learnRoutes);
// Search routes
app.use('/search', searchRoutes);
// Map routes
app.use('/map', mapRoutes);
// Short link redirect
app.get('/:slug', async (req, res, next) => {
    const { slug } = req.params;
    if (slug === 'favicon.ico' || slug.startsWith('images')) {
        return next();
    }
    try {
        const [rows] = await pool.query('SELECT id, TargetURL FROM ShortLinks WHERE Slug = ? LIMIT 1', [slug]);
        if (!rows || rows.length === 0) {
            return next();
        }
        const link = rows[0];
        pool.query('UPDATE ShortLinks SET ClickCount = ClickCount + 1 WHERE id = ?', [link.id]).catch((err) => console.error('ShortLinks click update failed:', err));
        return res.redirect(301, link.TargetURL);
    }
    catch (err) {
        console.error(err);
        return next();
    }
});
// 404 fallback
app.use((req, res) => {
    res.status(404).render('404', { message: 'Page not found' });
});
// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).render('500', { message: 'Server error' });
});
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
server.on('error', (err) => {
    console.error('Server failed to start:', err);
    process.exit(1);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason);
    process.exit(1);
});
