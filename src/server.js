// src/server.js
// NOTE: dotenv.config() is called in database.js (imported below) before the pool is created.
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import engine from 'ejs-mate';
import dotenv from 'dotenv';
import path from 'path';
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
import submitRoutes from './routes/submitRoutes.js';
import { showReportForm, submitReport } from './controllers/submitController.js';
import pool from './config/database.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Session database store setup
const MySQLStore = MySQLStoreFactory(session);
const sessionStore = new MySQLStore({}, pool);

// Middleware
// Only apply helmet security headers in production — locally it blocks images, fonts, maps etc.
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    hsts: true,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https://images.lesterslist.com", "https://maps.googleapis.com", "https://maps.gstatic.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://maps.googleapis.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        frameSrc: ["https://www.google.com"],
        connectSrc: ["'self'"],
      }
    }
  }));
}
// Gzip compress all responses — significantly reduces HTML/CSS/JSON transfer size
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files with long-lived cache headers so browsers cache CSS/JS/images
app.use(express.static(path.join(__dirname, '../src/public'), {
  maxAge: '7d',
  etag: true,
  lastModified: true
}));

// Trust reverse proxy (required on Hostinger so req.secure is correct and Secure cookies work)
app.set('trust proxy', 1);

// Session middleware
app.use(session({
  key: 'session_cookie_name',
  secret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 } // 24 hours; secure=true in production (HTTPS only)
}));

// EJS setup
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../src/views'));

// Expose admin session status and current path to all views
app.use((req, res, next) => {
  res.locals.isAdmin = !!(req.session && req.session.userId);
  res.locals.currentPath = req.path;
  next();
});

// Health check (must be before all other routes)
app.get('/health', (req, res) => res.status(200).send('OK'));

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

// Submit a Resource routes
app.use('/submit', submitRoutes);

// Report a Problem (top-level so ?type=X&id=Y links from any public page work)
app.get('/report', showReportForm);
app.post('/report', submitReport);

// Short link redirect
app.get('/:slug', async (req, res, next) => {
  const { slug } = req.params;

  if (slug === 'favicon.ico' || slug.startsWith('images')) {
    return next();
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, TargetURL FROM ShortLinks WHERE Slug = ? LIMIT 1',
      [slug]
    );

    if (!rows || rows.length === 0) {
      return next();
    }

    const link = rows[0];
    pool.query(
      'UPDATE ShortLinks SET ClickCount = ClickCount + 1 WHERE id = ?',
      [link.id]
    ).catch((err) => console.error('ShortLinks click update failed:', err));

    return res.redirect(301, link.TargetURL);
  } catch (err) {
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
  console.log(`Server started on port ${PORT}`);
});

server.on('error', (err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

export default app;

