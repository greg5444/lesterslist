"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showHome = showHome;
exports.showContact = showContact;
exports.showAbout = showAbout;
// src/controllers/homeController.js
const database_js_1 = __importDefault(require("../config/database.js"));
const siteSettingsModel_js_1 = __importDefault(require("../models/siteSettingsModel.js"));
const imageUtils_js_1 = require("../config/imageUtils.js");
async function showHome(req, res) {
    try {
        const today = new Date().toISOString().split('T')[0];
        // Parallel queries for community statistics
        const [[tickerConcerts], [[featuredBand]], [[featuredFestival]], [[featuredConcert]], [upcomingConcerts], [upcomingFestivals], [sidebarJams], [sidebarCamps], [[{ concertCount }]], [[{ festivalCount }]], [[{ jamCount }]], [[{ campCount }]]] = await Promise.all([
            // Ticker Data: Latest 5 Concerts
            database_js_1.default.query('SELECT ConcertNumber, ConcertName, VenueName FROM Concerts ORDER BY ConcertNumber DESC LIMIT 5'),
            // Discovery Trio - Query A: Random active band with photo and at least one upcoming concert
            database_js_1.default.query(`
        SELECT b.BandNumber, b.BandName, b.PictureURL
        FROM Bands b
        INNER JOIN (
          SELECT DISTINCT c.BandNumber
          FROM Concerts c
          WHERE c.BandNumber IS NOT NULL
            AND c.ConcertDate >= CURDATE()
        ) upcoming ON upcoming.BandNumber = b.BandNumber
        WHERE b.Active = 1
          AND b.PictureURL IS NOT NULL
          AND TRIM(b.PictureURL) <> ''
        ORDER BY RAND()
        LIMIT 1
      `),
            // Discovery Trio - Query B: Random Upcoming Festival with Featured Image
            database_js_1.default.query('SELECT FestivalNumber, FestivalName, StartDate, EndDate, FeaturedImageURL FROM Festivals WHERE StartDate >= CURDATE() AND FeaturedImageURL IS NOT NULL ORDER BY RAND() LIMIT 1'),
            // Discovery Trio - Query C: Random Upcoming Concert with Band Photo
            database_js_1.default.query(`
        SELECT c.ConcertNumber, c.ConcertName, c.ConcertDate, c.ConcertImage,
               COALESCE(v.VenueName, c.VenueName) as VenueName,
               COALESCE(v.City, c.City) as City,
               COALESCE(v.State, c.State) as State,
               b.PictureURL as BandPhoto
        FROM Concerts c
        LEFT JOIN Bands b ON c.BandNumber = b.BandNumber
        LEFT JOIN Venues v ON c.VenueNumber = v.VenueNumber
        WHERE c.ConcertDate >= CURDATE()
        ORDER BY RAND()
        LIMIT 1
      `),
            // Main Feed: Next 20 Upcoming Concerts
            database_js_1.default.query(`SELECT c.ConcertNumber, c.ConcertName, c.ConcertDate, 
                COALESCE(v.VenueName, c.VenueName) as VenueName,
                COALESCE(v.City, c.City) as City,
                COALESCE(v.State, c.State) as State,
                c.ConcertImage
         FROM Concerts c
         LEFT JOIN Venues v ON c.VenueNumber = v.VenueNumber
        WHERE c.ConcertDate >= CURDATE()
         ORDER BY c.ConcertDate ASC
         LIMIT 20`),
            // Main Feed: Next 20 Upcoming Festivals
            database_js_1.default.query(`SELECT f.FestivalNumber, f.FestivalName, f.StartDate, f.DateRange,
                COALESCE(v.City, f.City) as City,
                COALESCE(v.State, f.State) as State
         FROM Festivals f
         LEFT JOIN Venues v ON f.VenueNumber = v.VenueNumber
         WHERE f.StartDate >= CURDATE()
         ORDER BY f.StartDate ASC
         LIMIT 20`),
            // Sidebar Jams: Latest 5 Published Jams
            database_js_1.default.query("SELECT JamID, JamName, City, State, Schedule FROM LocalJams WHERE Status = 'Published' ORDER BY JamID DESC LIMIT 5"),
            // Sidebar Camps: Next 3 Upcoming Camps
            database_js_1.default.query('SELECT JDNumber, EventName, DateRange FROM Camps ORDER BY StartDate ASC LIMIT 3'),
            // Community Stats: Upcoming Concerts (Date >= Today)
            database_js_1.default.query('SELECT COUNT(*) AS concertCount FROM Concerts WHERE ConcertDate >= ?', [today]),
            // Community Stats: Active Festivals (EndDate >= Today)
            database_js_1.default.query('SELECT COUNT(*) AS festivalCount FROM Festivals WHERE EndDate >= ?', [today]),
            // Community Stats: Active Jams
            database_js_1.default.query("SELECT COUNT(*) AS jamCount FROM LocalJams WHERE Status = 'Published'"),
            // Community Stats: Total Camps
            database_js_1.default.query('SELECT COUNT(*) AS campCount FROM Camps')
        ]);
        // Get ticker settings from database
        const tickerSettings = await siteSettingsModel_js_1.default.getTickerSettings();
        let tickerMessages = [];
        // Parse ticker messages JSON
        try {
            tickerMessages = JSON.parse(tickerSettings.ticker_text || '[]');
            // Replace placeholders with actual counts in each message
            tickerMessages = tickerMessages.map(msg => ({
                text: msg.text
                    .replace(/{concertCount}/g, concertCount)
                    .replace(/{festivalCount}/g, festivalCount)
                    .replace(/{jamCount}/g, jamCount)
                    .replace(/{campCount}/g, campCount),
                url: msg.url || ''
            }));
        }
        catch (e) {
            console.error('Error parsing ticker messages:', e);
        }
        // Discovery Trio - Process Images & Alignment
        if (featuredBand) {
            const { url, alignment } = (0, imageUtils_js_1.parseImageAlignment)((0, imageUtils_js_1.resolveImageUrl)(featuredBand.PictureURL));
            featuredBand.PictureURL = url;
            featuredBand.imageAlignment = alignment;
        }
        if (featuredFestival) {
            const { url, alignment } = (0, imageUtils_js_1.parseImageAlignment)((0, imageUtils_js_1.resolveImageUrl)(featuredFestival.FeaturedImageURL));
            featuredFestival.FeaturedImageURL = url;
            featuredFestival.imageAlignment = alignment;
        }
        if (featuredConcert) {
            const rawConcertUrl = (featuredConcert.ConcertImage && featuredConcert.ConcertImage.trim().length > 5)
                ? (0, imageUtils_js_1.resolveImageUrl)(featuredConcert.ConcertImage)
                : (featuredConcert.BandPhoto && featuredConcert.BandPhoto.trim().length > 5)
                    ? (0, imageUtils_js_1.resolveImageUrl)(featuredConcert.BandPhoto)
                    : 'https://images.lesterslist.com/media/All-bluegrass.jpg';
            const { url, alignment } = (0, imageUtils_js_1.parseImageAlignment)(rawConcertUrl);
            featuredConcert.imageUrl = url;
            featuredConcert.imageAlignment = alignment;
        }
        res.render('index', {
            title: "Lester's List - Bluegrass Events",
            tickerEnabled: tickerSettings.ticker_enabled !== false,
            tickerMessages: tickerMessages,
            tickerSpeed: tickerSettings.ticker_speed || 'medium',
            tickerConcerts,
            featuredBand: featuredBand || null,
            featuredFestival: featuredFestival || null,
            featuredConcert: featuredConcert || null,
            upcomingConcerts,
            upcomingFestivals,
            sidebarJams,
            sidebarCamps,
            concertCount,
            festivalCount,
            jamCount,
            campCount
        });
    }
    catch (err) {
        console.error('Error loading homepage:', err);
        res.status(500).render('500', { message: 'Server error' });
    }
}
async function showContact(req, res) {
    try {
        res.render('contact', {
            title: "Contact Us - Lester's List"
        });
    }
    catch (err) {
        console.error('Error loading contact page:', err);
        res.status(500).render('500', { message: 'Server error' });
    }
}
async function showAbout(req, res) {
    try {
        res.render('about', {
            title: "About Us - Lester's List"
        });
    }
    catch (err) {
        console.error('Error loading about page:', err);
        res.status(500).render('500', { message: 'Server error' });
    }
}
