"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showSubmitHub = showSubmitHub;
exports.showFestivalForm = showFestivalForm;
exports.submitFestival = submitFestival;
exports.showBandForm = showBandForm;
exports.submitBand = submitBand;
exports.showCampForm = showCampForm;
exports.submitCamp = submitCamp;
exports.showVenueForm = showVenueForm;
exports.submitVenue = submitVenue;
exports.showPhotosForm = showPhotosForm;
exports.submitPhotos = submitPhotos;
exports.showReportForm = showReportForm;
exports.submitReport = submitReport;
// src/controllers/submitController.js
const submissionModel_js_1 = __importDefault(require("../models/submissionModel.js"));
const email_js_1 = require("../config/email.js");
// Honeypot field name — if filled, it's a bot
const HONEYPOT_FIELD = 'website_url';
function isHoneypotTripped(body) {
    return body[HONEYPOT_FIELD] && body[HONEYPOT_FIELD].trim() !== '';
}
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// ── Hub ──────────────────────────────────────────────────────────────────────
function showSubmitHub(req, res) {
    res.render('submit/index', { title: 'Submit a Resource' });
}
// ── Festival ─────────────────────────────────────────────────────────────────
function showFestivalForm(req, res) {
    res.render('submit/festival', { title: 'Submit a Festival', success: false, error: null, formData: {} });
}
async function submitFestival(req, res) {
    const { FestivalName, StartDate, EndDate, FestivalWebsite, FestivalFlyerURL, VenueName, City, State, Zip, GoogleMapAddress, Notes, ContactName, ContactEmail, ContactPhone, AuthorizedToSubmit } = req.body;
    if (isHoneypotTripped(req.body))
        return res.redirect('/submit');
    const renderForm = (error) => res.render('submit/festival', { title: 'Submit a Festival', success: false, error, formData: req.body });
    if (!FestivalName || !StartDate || !EndDate || !City || !State)
        return renderForm('Please fill in all required fields.');
    if (!ContactName || !ContactEmail)
        return renderForm('Contact name and email are required.');
    if (!emailRegex.test(ContactEmail))
        return renderForm('Please enter a valid email address.');
    if (!AuthorizedToSubmit)
        return renderForm('You must confirm authorization to submit.');
    const data = { FestivalName, StartDate, EndDate, FestivalWebsite: FestivalWebsite || null, FestivalFlyerURL: FestivalFlyerURL || null, VenueName: VenueName || null, City, State, Zip: Zip || null, GoogleMapAddress: GoogleMapAddress || null, Notes: Notes || null };
    try {
        await submissionModel_js_1.default.create('festival', data, ContactName, ContactEmail, ContactPhone || null);
        await (0, email_js_1.sendSubmissionNotification)('festival', data, { ContactName, ContactEmail, ContactPhone });
        res.render('submit/festival', { title: 'Submit a Festival', success: true, error: null, formData: {} });
    }
    catch (err) {
        console.error('Festival submission error:', err);
        renderForm('An error occurred. Please try again.');
    }
}
// ── Band ─────────────────────────────────────────────────────────────────────
function showBandForm(req, res) {
    res.render('submit/band', { title: 'Submit a Band / Tour Update', success: false, error: null, formData: {} });
}
async function submitBand(req, res) {
    const { SubmissionType, BandName, BandWebsite, HomeCity, HomeState, TourDates, Notes, ContactName, ContactEmail, ContactPhone, AuthorizedToSubmit } = req.body;
    if (isHoneypotTripped(req.body))
        return res.redirect('/submit');
    const renderForm = (error) => res.render('submit/band', { title: 'Submit a Band / Tour Update', success: false, error, formData: req.body });
    if (!BandName || !SubmissionType)
        return renderForm('Please fill in all required fields.');
    if (!ContactName || !ContactEmail)
        return renderForm('Contact name and email are required.');
    if (!emailRegex.test(ContactEmail))
        return renderForm('Please enter a valid email address.');
    if (!AuthorizedToSubmit)
        return renderForm('You must confirm authorization to submit.');
    const data = { SubmissionType, BandName, BandWebsite: BandWebsite || null, HomeCity: HomeCity || null, HomeState: HomeState || null, TourDates: TourDates || null, Notes: Notes || null };
    try {
        await submissionModel_js_1.default.create('band', data, ContactName, ContactEmail, ContactPhone || null);
        await (0, email_js_1.sendSubmissionNotification)('band', data, { ContactName, ContactEmail, ContactPhone });
        res.render('submit/band', { title: 'Submit a Band / Tour Update', success: true, error: null, formData: {} });
    }
    catch (err) {
        console.error('Band submission error:', err);
        renderForm('An error occurred. Please try again.');
    }
}
// ── Camp ─────────────────────────────────────────────────────────────────────
function showCampForm(req, res) {
    res.render('submit/camp', { title: 'Submit a Camp / Workshop', success: false, error: null, formData: {} });
}
async function submitCamp(req, res) {
    const { EventName, StartDate, EndDate, ExternalURL, VenueName, Street, City, State, Zip, GoogleMapAddress, Notes, ContactName, ContactEmail, ContactPhone, AuthorizedToSubmit } = req.body;
    if (isHoneypotTripped(req.body))
        return res.redirect('/submit');
    const renderForm = (error) => res.render('submit/camp', { title: 'Submit a Camp / Workshop', success: false, error, formData: req.body });
    if (!EventName || !StartDate || !EndDate || !City || !State)
        return renderForm('Please fill in all required fields.');
    if (!ContactName || !ContactEmail)
        return renderForm('Contact name and email are required.');
    if (!emailRegex.test(ContactEmail))
        return renderForm('Please enter a valid email address.');
    if (!AuthorizedToSubmit)
        return renderForm('You must confirm authorization to submit.');
    const data = { EventName, StartDate, EndDate, ExternalURL: ExternalURL || null, VenueName: VenueName || null, Street: Street || null, City, State, Zip: Zip || null, GoogleMapAddress: GoogleMapAddress || null, Notes: Notes || null };
    try {
        await submissionModel_js_1.default.create('camp', data, ContactName, ContactEmail, ContactPhone || null);
        await (0, email_js_1.sendSubmissionNotification)('camp', data, { ContactName, ContactEmail, ContactPhone });
        res.render('submit/camp', { title: 'Submit a Camp / Workshop', success: true, error: null, formData: {} });
    }
    catch (err) {
        console.error('Camp submission error:', err);
        renderForm('An error occurred. Please try again.');
    }
}
// ── Venue ─────────────────────────────────────────────────────────────────────
function showVenueForm(req, res) {
    res.render('submit/venue', { title: 'Submit a Venue', success: false, error: null, formData: {} });
}
async function submitVenue(req, res) {
    const { VenueName, VenueWebsite, Street, City, State, Zip, GoogleMapAddress, Notes, ContactName, ContactEmail, ContactPhone, AuthorizedToSubmit } = req.body;
    if (isHoneypotTripped(req.body))
        return res.redirect('/submit');
    const renderForm = (error) => res.render('submit/venue', { title: 'Submit a Venue', success: false, error, formData: req.body });
    if (!VenueName || !Street || !City || !State || !GoogleMapAddress)
        return renderForm('Please fill in all required fields.');
    if (!ContactName || !ContactEmail)
        return renderForm('Contact name and email are required.');
    if (!emailRegex.test(ContactEmail))
        return renderForm('Please enter a valid email address.');
    if (!AuthorizedToSubmit)
        return renderForm('You must confirm authorization to submit.');
    const data = { VenueName, VenueWebsite: VenueWebsite || null, Street, City, State, Zip: Zip || null, GoogleMapAddress, Notes: Notes || null };
    try {
        await submissionModel_js_1.default.create('venue', data, ContactName, ContactEmail, ContactPhone || null);
        await (0, email_js_1.sendSubmissionNotification)('venue', data, { ContactName, ContactEmail, ContactPhone });
        res.render('submit/venue', { title: 'Submit a Venue', success: true, error: null, formData: {} });
    }
    catch (err) {
        console.error('Venue submission error:', err);
        renderForm('An error occurred. Please try again.');
    }
}
// ── Photos ────────────────────────────────────────────────────────────────────
function showPhotosForm(req, res) {
    res.render('submit/photos', { title: 'Submit Photos', success: false, error: null, formData: {} });
}
async function submitPhotos(req, res) {
    const { PhotoType, RelatedName, ImageURL, Caption, OwnsRights, ContactName, ContactEmail, ContactPhone, AuthorizedToSubmit } = req.body;
    if (isHoneypotTripped(req.body))
        return res.redirect('/submit');
    const renderForm = (error) => res.render('submit/photos', { title: 'Submit Photos', success: false, error, formData: req.body });
    if (!PhotoType || !RelatedName || !Caption)
        return renderForm('Please fill in all required fields.');
    if (!ContactName || !ContactEmail)
        return renderForm('Contact name and email are required.');
    if (!emailRegex.test(ContactEmail))
        return renderForm('Please enter a valid email address.');
    if (!OwnsRights)
        return renderForm('You must confirm you own or have rights to this photo.');
    if (!AuthorizedToSubmit)
        return renderForm('You must confirm authorization to submit.');
    const data = { PhotoType, RelatedName, ImageURL: ImageURL || null, Caption };
    try {
        await submissionModel_js_1.default.create('photos', data, ContactName, ContactEmail, ContactPhone || null);
        await (0, email_js_1.sendSubmissionNotification)('photos', data, { ContactName, ContactEmail, ContactPhone });
        res.render('submit/photos', { title: 'Submit Photos', success: true, error: null, formData: {} });
    }
    catch (err) {
        console.error('Photos submission error:', err);
        renderForm('An error occurred. Please try again.');
    }
}
// ── Report a Problem ──────────────────────────────────────────────────────────
function showReportForm(req, res) {
    const { type, id } = req.query;
    // Build full page URL from type/id if provided
    let pageUrl = '';
    if (type && id) {
        const protocol = req.protocol || 'https';
        const host = req.get('host') || 'lesterslist.com';
        const pathMap = {
            concert: `/concerts/${id}`,
            festival: `/festivals/${id}`,
            camp: `/camps/${id}`,
            band: `/bands/${id}`,
            jam: `/jams/${id}`,
            venue: `/venues/${id}`,
        };
        if (pathMap[type]) {
            pageUrl = `${protocol}://${host}${pathMap[type]}`;
        }
    }
    res.render('report/new', {
        title: 'Report a Problem',
        success: false,
        error: null,
        sourceType: type || '',
        sourceId: id || '',
        formData: { PageURL: pageUrl },
    });
}
async function submitReport(req, res) {
    const { SourceType, SourceID, PageURL, Description, ContactName, ContactEmail, ContactPhone, AuthorizedToSubmit, nickname } = req.body;
    // Honeypot check (field name is 'nickname' per spec)
    if (nickname && nickname.trim() !== '')
        return res.redirect('/');
    const renderForm = (error) => res.render('report/new', {
        title: 'Report a Problem',
        success: false,
        error,
        sourceType: SourceType || '',
        sourceId: SourceID || '',
        formData: req.body,
    });
    if (!PageURL || !PageURL.trim())
        return renderForm('Please provide the page URL.');
    if (!Description || !Description.trim())
        return renderForm('Please describe the problem.');
    if (!ContactName || !ContactEmail)
        return renderForm('Contact name and email are required.');
    if (!emailRegex.test(ContactEmail))
        return renderForm('Please enter a valid email address.');
    if (!AuthorizedToSubmit)
        return renderForm('Please confirm your submission.');
    const data = {
        SourceType: SourceType || 'unknown',
        SourceID: SourceID || null,
        PageURL: PageURL.trim(),
        Description,
    };
    try {
        await submissionModel_js_1.default.create('report', data, ContactName, ContactEmail, ContactPhone || null);
        await (0, email_js_1.sendSubmissionNotification)('report', data, { ContactName, ContactEmail, ContactPhone });
        res.render('report/new', {
            title: 'Report a Problem',
            success: true,
            error: null,
            sourceType: SourceType || '',
            sourceId: SourceID || '',
            formData: {},
        });
    }
    catch (err) {
        console.error('Report submission error:', err);
        renderForm('An error occurred. Please try again.');
    }
}
