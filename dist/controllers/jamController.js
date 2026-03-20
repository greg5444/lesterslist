"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listJams = listJams;
exports.showJamDetail = showJamDetail;
exports.showJamForm = showJamForm;
exports.submitJam = submitJam;
// src/controllers/jamController.js
const localJamModel_js_1 = __importDefault(require("../models/localJamModel.js"));
const email_js_1 = require("../config/email.js");
async function listJams(req, res) {
    try {
        const currentView = req.query.view === 'list' ? 'list' : 'gallery';
        const currentPage = parseInt(req.query.page) || 1;
        const itemsPerPage = [30, 60].includes(parseInt(req.query.limit)) ? parseInt(req.query.limit) : 30;
        const offset = (currentPage - 1) * itemsPerPage;
        const filterState = req.query.state || '';
        const filters = { state: filterState || null };
        const [jams, totalCount, filterOptions] = await Promise.all([
            localJamModel_js_1.default.findPublishedFiltered(itemsPerPage, offset, filters),
            localJamModel_js_1.default.countPublishedFiltered(filters),
            localJamModel_js_1.default.getFilterOptions()
        ]);
        const totalPages = Math.ceil(totalCount / itemsPerPage);
        res.render('jams/index', {
            title: 'Local Jams – Find Your Circle',
            jams,
            currentView,
            currentPage,
            totalPages,
            totalCount,
            itemsPerPage,
            filterState,
            filterOptions
        });
    }
    catch (err) {
        console.error('Error fetching jams:', err);
        res.status(500).render('500', { message: 'Server error' });
    }
}
async function showJamDetail(req, res) {
    try {
        const { JamID } = req.params;
        if (!JamID || isNaN(Number(JamID))) {
            return res.status(400).render('400', { message: 'Invalid Jam ID.' });
        }
        const jam = await localJamModel_js_1.default.findById(JamID);
        if (!jam) {
            return res.status(404).render('404', { message: 'Jam not found.' });
        }
        res.render('jams/detail', {
            title: jam.JamName,
            jam,
            googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
        });
    }
    catch (err) {
        console.error('Error fetching jam detail:', err);
        res.status(500).render('500', { message: 'Server error' });
    }
}
function showJamForm(req, res) {
    res.render('jams/new', { title: 'Submit a Jam', success: false, error: null });
}
async function submitJam(req, res) {
    const { JamName, VenueName, Schedule, AllWelcome, BeginnersWelcome, AdvancedOnly, ContactName, ContactEmail, ContactPhone, ShowPhone, City, State, Zip, GoogleMapAddress } = req.body;
    // Validate required fields
    if (!JamName || !VenueName || !Schedule || !ContactName || !ContactEmail || !ContactPhone) {
        return res.render('jams/new', { title: 'Submit a Jam', success: false, error: 'Required fields are missing.' });
    }
    const locationMissing = !City || !City.trim() || !State || !State.trim() || !Zip || !Zip.trim() || !GoogleMapAddress || !GoogleMapAddress.trim();
    if (locationMissing) {
        return res.render('jams/new', { title: 'Submit a Jam', success: false, error: 'Location details are required for the map.' });
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(ContactEmail)) {
        return res.render('jams/new', { title: 'Submit a Jam', success: false, error: 'Please enter a valid email address.' });
    }
    try {
        // Save jam to database as Draft
        const jamData = {
            JamName,
            VenueName,
            Schedule,
            AllWelcome: AllWelcome === 'on' || AllWelcome === '1' || AllWelcome === true,
            BeginnersWelcome: BeginnersWelcome === 'on' || BeginnersWelcome === '1' || BeginnersWelcome === true,
            AdvancedOnly: AdvancedOnly === 'on' || AdvancedOnly === '1' || AdvancedOnly === true,
            ContactName,
            ContactEmail,
            ContactPhone,
            ShowPhone: ShowPhone === 'on' || ShowPhone === '1' || ShowPhone === true,
            City,
            State,
            Zip,
            GoogleMapAddress
        };
        await localJamModel_js_1.default.create(jamData);
        // Send email notification to admin
        const emailResult = await (0, email_js_1.sendJamNotification)(jamData);
        if (!emailResult.success) {
            console.error('Email notification failed:', emailResult.error);
            // Still show success to user even if email fails
        }
        res.render('jams/new', { title: 'Submit a Jam', success: true, error: null });
    }
    catch (error) {
        console.error('Error submitting jam:', error);
        res.render('jams/new', { title: 'Submit a Jam', success: false, error: 'An error occurred. Please try again.' });
    }
}
