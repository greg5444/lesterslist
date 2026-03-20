"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.js
// NOTE: dotenv.config() is called in database.js (imported below) before the pool is created.
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const express_session_1 = __importDefault(require("express-session"));
const express_mysql_session_1 = __importDefault(require("express-mysql-session"));
const ejs_mate_1 = __importDefault(require("ejs-mate"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const bandRoutes_js_1 = __importDefault(require("./routes/bandRoutes.js"));
const venueRoutes_js_1 = __importDefault(require("./routes/venueRoutes.js"));
const concertRoutes_js_1 = __importDefault(require("./routes/concertRoutes.js"));
const festivalRoutes_js_1 = __importDefault(require("./routes/festivalRoutes.js"));
const campRoutes_js_1 = __importDefault(require("./routes/campRoutes.js"));
const jamRoutes_js_1 = __importDefault(require("./routes/jamRoutes.js"));
const learnRoutes_js_1 = __importDefault(require("./routes/learnRoutes.js"));
const mapRoutes_js_1 = __importDefault(require("./routes/mapRoutes.js"));
const searchRoutes_js_1 = __importDefault(require("./routes/searchRoutes.js"));
const homeRoutes_js_1 = __importDefault(require("./routes/homeRoutes.js"));
const adminRoutes_js_1 = __importDefault(require("./routes/adminRoutes.js"));
const submitRoutes_js_1 = __importDefault(require("./routes/submitRoutes.js"));
const submitController_js_1 = require("./controllers/submitController.js");
const database_js_1 = __importDefault(require("./config/database.js"));
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3000;
// Session database store setup
const MySQLStore = (0, express_mysql_session_1.default)(express_session_1.default);
const sessionStore = new MySQLStore({}, database_js_1.default);
// Middleware
// Only apply helmet security headers in production — locally it blocks images, fonts, maps etc.
if (process.env.NODE_ENV === 'production') {
    app.use((0, helmet_1.default)({
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
app.use((0, compression_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files with long-lived cache headers so browsers cache CSS/JS/images
app.use(express_1.default.static(path_1.default.join(__dirname, '../src/public'), {
    maxAge: '7d',
    etag: true,
    lastModified: true
}));
// Trust reverse proxy (required on Hostinger so req.secure is correct and Secure cookies work)
app.set('trust proxy', 1);
// Session middleware
app.use((0, express_session_1.default)({
    key: 'session_cookie_name',
    secret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 } // 24 hours; secure=true in production (HTTPS only)
}));
// EJS setup
app.engine('ejs', ejs_mate_1.default);
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, '../src/views'));
// Expose admin session status and current path to all views
app.use((req, res, next) => {
    res.locals.isAdmin = !!(req.session && req.session.userId);
    res.locals.currentPath = req.path;
    next();
});
// Health check (must be before all other routes)
app.get('/health', (req, res) => res.status(200).send('OK'));
// Homepage route (must be first)
app.use('/', homeRoutes_js_1.default);
// Admin routes
app.use('/admin', adminRoutes_js_1.default);
// Band routes
app.use('/bands', bandRoutes_js_1.default);
// Venue routes
app.use('/venues', venueRoutes_js_1.default);
// Concert routes
app.use('/concerts', concertRoutes_js_1.default);
// Festival routes
app.use('/festivals', festivalRoutes_js_1.default);
// Camp routes
app.use('/camps', campRoutes_js_1.default);
// Jam routes
app.use('/jams', jamRoutes_js_1.default);
// Learn routes
app.use('/learn', learnRoutes_js_1.default);
// Search routes
app.use('/search', searchRoutes_js_1.default);
// Map routes
app.use('/map', mapRoutes_js_1.default);
// Submit a Resource routes
app.use('/submit', submitRoutes_js_1.default);
// Report a Problem (top-level so ?type=X&id=Y links from any public page work)
app.get('/report', submitController_js_1.showReportForm);
app.post('/report', submitController_js_1.submitReport);
// Short link redirect
app.get('/:slug', async (req, res, next) => {
    const { slug } = req.params;
    if (slug === 'favicon.ico' || slug.startsWith('images')) {
        return next();
    }
    try {
        const [rows] = await database_js_1.default.query('SELECT id, TargetURL FROM ShortLinks WHERE Slug = ? LIMIT 1', [slug]);
        if (!rows || rows.length === 0) {
            return next();
        }
        const link = rows[0];
        database_js_1.default.query('UPDATE ShortLinks SET ClickCount = ClickCount + 1 WHERE id = ?', [link.id]).catch((err) => console.error('ShortLinks click update failed:', err));
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
exports.default = app;
