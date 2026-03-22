"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCamps = listCamps;
exports.showCamp = showCamp;
// src/controllers/campController.js
const campModel_js_1 = __importDefault(require("../models/campModel.js"));
const constants_js_1 = require("../config/constants.js");
const imageUtils_js_1 = require("../config/imageUtils.js");
async function listCamps(req, res) {
    try {
        const filterState = req.query.state || '';
        const filterMonth = req.query.month || '';
        const lat = req.query.lat ? parseFloat(req.query.lat) : null;
        const lng = req.query.lng ? parseFloat(req.query.lng) : null;
        const radius = parseInt(req.query.radius) || 50;
        const filters = { state: filterState || null, month: filterMonth || null, lat, lng, radius };
        const [camps, filterOptions] = await Promise.all([
            campModel_js_1.default.findUpcomingFiltered(200, 0, filters),
            campModel_js_1.default.getFilterOptions()
        ]);
        const campsWithImages = camps.map(camp => {
            const { url: imageUrl, alignment: imageAlignment } = (0, imageUtils_js_1.parseImageAlignment)((0, imageUtils_js_1.resolveImageUrl)(camp.ImageURL));
            return { ...camp, imageUrl, imageAlignment };
        });
        res.render('camps/index', {
            title: 'Camps & Workshops',
            camps: campsWithImages,
            filterState,
            filterMonth,
            filterOptions
        });
    }
    catch (err) {
        console.error('Error fetching camps:', err);
        res.status(500).render('500', { message: 'Server error' });
    }
}
async function showCamp(req, res) {
    try {
        const camp = await campModel_js_1.default.findById(req.params.id);
        if (!camp)
            return res.status(404).render('404', { message: 'Camp/Workshop not found' });
        const { url: imageUrl, alignment: imageAlignment } = (0, imageUtils_js_1.parseImageAlignment)((0, imageUtils_js_1.resolveImageUrl)(camp.ImageURL));
        // Sanitize GoogleMapAddress — reject URLs and q=place: junk
        const mapAddress = (0, imageUtils_js_1.sanitizeMapAddress)(camp.GoogleMapAddress, camp);
        res.render('camps/show', {
            title: camp.EventName,
            camp,
            imageUrl,
            imageAlignment,
            mapAddress,
            googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
        });
    }
    catch (err) {
        console.error('Error fetching camp:', err);
        res.status(500).render('500', { message: 'Server error' });
    }
}
