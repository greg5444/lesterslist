"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = search;
// src/controllers/searchController.js
const database_js_1 = __importDefault(require("../config/database.js"));
// All 50 US state codes for strict matching
const STATE_CODES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
// State name to code mapping for smart search
const stateMap = {
    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
    'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
    'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
    'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
    'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
    'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
    'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
    'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
    'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
    'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
};
// Month name to number mapping
const monthMap = {
    'january': 1, 'jan': 1,
    'february': 2, 'feb': 2,
    'march': 3, 'mar': 3,
    'april': 4, 'apr': 4,
    'may': 5,
    'june': 6, 'jun': 6,
    'july': 7, 'jul': 7,
    'august': 8, 'aug': 8,
    'september': 9, 'sep': 9, 'sept': 9,
    'october': 10, 'oct': 10,
    'november': 11, 'nov': 11,
    'december': 12, 'dec': 12
};
async function search(req, res) {
    try {
        const query = req.query.q || '';
        if (!query.trim()) {
            return res.render('search/results', {
                title: 'Search Results',
                query: '',
                bands: [],
                concerts: [],
                festivals: [],
                jams: [],
                camps: []
            });
        }
        // Detect Strict State Mode
        const queryLower = query.toLowerCase().trim();
        const queryUpper = query.toUpperCase().trim();
        // Check if this is a state code (2 letters) or state name
        const mappedCode = stateMap[queryLower];
        const isStateCode = STATE_CODES.includes(queryUpper);
        const strictStateCode = mappedCode || (isStateCode ? queryUpper : null);
        // If strict state mode, use exact state matching only
        if (strictStateCode) {
            // STRICT MODE: State Code detected (e.g., "NC", "IN", "Tennessee")
            // Only search State column with exact match - no text matching
            const [bandsResult, concertsResult, festivalsResult, jamsResult, campsResult] = await Promise.all([
                // Bands have no state - return empty
                Promise.resolve([[]]),
                // Concerts - strict state match only
                database_js_1.default.query(`
          SELECT c.ConcertNumber, c.ConcertName, c.ConcertDate, c.ConcertImage,
                 v.VenueName, v.City, v.State
          FROM Concerts c
          LEFT JOIN Venues v ON c.VenueNumber = v.VenueNumber
          WHERE v.State = ?
          ORDER BY c.ConcertDate ASC
          LIMIT 50
        `, [strictStateCode]),
                // Festivals - strict state match only
                database_js_1.default.query(`
          SELECT f.FestivalNumber, f.FestivalName, f.StartDate, f.FestivalFlyerURL,
                 v.VenueName, v.City, v.State
          FROM Festivals f
          LEFT JOIN Venues v ON f.VenueNumber = v.VenueNumber
          WHERE v.State = ?
          ORDER BY f.StartDate ASC
          LIMIT 50
        `, [strictStateCode]),
                // Jams - strict state match only
                database_js_1.default.query(`
          SELECT JamID, JamName, City, State, Schedule
          FROM LocalJams
          WHERE Status = 'Published' AND State = ?
          ORDER BY JamName ASC
          LIMIT 50
        `, [strictStateCode]),
                // Camps - strict state match only
                database_js_1.default.query(`
          SELECT JDNumber, EventName, StartDate, VenueName, City, State
          FROM Camps
          WHERE State = ?
          ORDER BY StartDate DESC
          LIMIT 50
        `, [strictStateCode])
            ]);
            const bands = bandsResult[0];
            const concerts = concertsResult[0];
            const festivals = festivalsResult[0];
            const jams = jamsResult[0];
            const camps = campsResult[0];
            return res.render('search/results', {
                title: `Search Results for "${query}"`,
                query,
                bands,
                concerts,
                festivals,
                jams,
                camps
            });
        }
        // STANDARD MODE: Normal text search with partial matching
        let searchPattern = `%${query}%`;
        let additionalStatePattern = null;
        // Check if query matches a state name for additional OR condition
        if (stateMap[queryLower]) {
            const stateCode = stateMap[queryLower];
            additionalStatePattern = `%${stateCode}%`;
        }
        // Date detection logic
        let searchYear = null;
        let searchMonth = null;
        let searchDate = null;
        // Check for year (4 digits)
        if (/^\d{4}$/.test(query)) {
            searchYear = parseInt(query);
        }
        // Check for specific date (YYYY-MM-DD or similar formats)
        else if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(query)) {
            searchDate = query;
        }
        // Check for month name
        else if (monthMap[queryLower]) {
            searchMonth = monthMap[queryLower];
        }
        // Check for numeric month (1-12)
        else if (/^\d{1,2}$/.test(query)) {
            const monthNum = parseInt(query);
            if (monthNum >= 1 && monthNum <= 12) {
                searchMonth = monthNum;
            }
        }
        // Build dynamic SQL conditions and parameters
        let concertTextConditions = [];
        let concertDateConditions = [];
        let concertParams = [];
        let festivalTextConditions = [];
        let festivalDateConditions = [];
        let festivalParams = [];
        // Add name/location conditions (for non-date searches or combined with date)
        concertTextConditions.push('c.ConcertName LIKE ?');
        concertTextConditions.push('v.VenueName LIKE ?');
        concertTextConditions.push('v.City LIKE ?');
        festivalTextConditions.push('f.FestivalName LIKE ?');
        festivalTextConditions.push('v.City LIKE ?');
        festivalTextConditions.push('v.State LIKE ?');
        // Add date conditions for concerts
        if (searchYear) {
            concertDateConditions.push('YEAR(c.ConcertDate) = ?');
            concertParams.push(searchYear);
        }
        if (searchMonth) {
            concertDateConditions.push('MONTH(c.ConcertDate) = ?');
            concertParams.push(searchMonth);
        }
        if (searchDate) {
            concertDateConditions.push('DATE(c.ConcertDate) = ?');
            concertParams.push(searchDate);
        }
        // Add date conditions for festivals
        if (searchYear) {
            festivalDateConditions.push('YEAR(f.StartDate) = ?');
            festivalParams.push(searchYear);
        }
        if (searchMonth) {
            festivalDateConditions.push('MONTH(f.StartDate) = ?');
            festivalParams.push(searchMonth);
        }
        if (searchDate) {
            festivalDateConditions.push('DATE(f.StartDate) = ?');
            festivalParams.push(searchDate);
        }
        // Build final WHERE clauses
        let concertWhereClause, festivalWhereClause;
        if (concertDateConditions.length > 0) {
            // Date search: Only filter by date
            concertWhereClause = concertDateConditions.join(' AND ');
        }
        else {
            // Text search: Search in name/venue/location
            concertWhereClause = concertTextConditions.join(' OR ');
            if (additionalStatePattern) {
                concertWhereClause += ' OR v.State LIKE ?';
                concertParams.push(additionalStatePattern);
            }
            // Add text search params
            concertParams.unshift(searchPattern, searchPattern, searchPattern);
        }
        if (festivalDateConditions.length > 0) {
            // Date search: Only filter by date
            festivalWhereClause = festivalDateConditions.join(' AND ');
        }
        else {
            // Text search: Search in name/location
            festivalWhereClause = festivalTextConditions.join(' OR ');
            if (additionalStatePattern) {
                festivalWhereClause += ' OR v.State LIKE ?';
                festivalParams.push(additionalStatePattern);
            }
            // Add text search params
            festivalParams.unshift(searchPattern, searchPattern, searchPattern);
        }
        // Run 4 parallel queries (removed venues)
        const [bandsResult, concertsResult, festivalsResult, jamsResult, campsResult] = await Promise.all([
            // Bands query
            database_js_1.default.query('SELECT BandNumber, BandName, PictureURL, BandWebsite FROM Bands WHERE BandName LIKE ? ORDER BY BandName ASC LIMIT 50', [searchPattern]),
            // Concerts query (with venue info and date logic)
            database_js_1.default.query(`
        SELECT c.ConcertNumber, c.ConcertName, c.ConcertDate, c.ConcertImage,
               v.VenueName, v.City, v.State
        FROM Concerts c
        LEFT JOIN Venues v ON c.VenueNumber = v.VenueNumber
        WHERE ${concertWhereClause}
        ORDER BY c.ConcertDate ASC
        LIMIT 50
      `, concertParams),
            // Festivals query (with venue info and date logic)
            database_js_1.default.query(`SELECT f.FestivalNumber, f.FestivalName, f.StartDate, f.FestivalFlyerURL,
                v.VenueName, v.City, v.State
         FROM Festivals f
         LEFT JOIN Venues v ON f.VenueNumber = v.VenueNumber
         WHERE ${festivalWhereClause}
         ORDER BY f.StartDate ASC 
         LIMIT 50`, festivalParams),
            // Jams query (Published only) - include state code search
            database_js_1.default.query(`SELECT JamID, JamName, City, State, Schedule 
         FROM LocalJams 
         WHERE Status = 'Published' 
           AND (JamName LIKE ? OR City LIKE ? OR State LIKE ? ${additionalStatePattern ? 'OR State LIKE ?' : ''})
         ORDER BY JamName ASC
         LIMIT 50`, additionalStatePattern ? [searchPattern, searchPattern, searchPattern, additionalStatePattern] : [searchPattern, searchPattern, searchPattern]),
            // Camps query (EventName, VenueName, City, State)
            database_js_1.default.query(`SELECT JDNumber, EventName, StartDate, VenueName, City, State
         FROM Camps
         WHERE EventName LIKE ? OR VenueName LIKE ? OR City LIKE ? OR State LIKE ?
         ORDER BY StartDate DESC
         LIMIT 50`, [searchPattern, searchPattern, searchPattern, searchPattern])
        ]);
        const bands = bandsResult[0];
        const concerts = concertsResult[0];
        const festivals = festivalsResult[0];
        const jams = jamsResult[0];
        const camps = campsResult[0];
        res.render('search/results', {
            title: `Search Results for "${query}"`,
            query,
            bands,
            concerts,
            festivals,
            jams,
            camps
        });
    }
    catch (err) {
        console.error('Search error:', err);
        res.status(500).render('500', { message: 'Search failed' });
    }
}
