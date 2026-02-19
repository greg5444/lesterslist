"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showVenue = showVenue;
// src/controllers/venueController.js
const venueModel_js_1 = __importDefault(require("../models/venueModel.js"));
async function showVenue(req, res) {
    try {
        const venue = await venueModel_js_1.default.findById(req.params.id);
        if (!venue)
            return res.status(404).render('404', { message: 'Venue not found' });
        const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
        const concerts = await venueModel_js_1.default.findLinkedConcerts(req.params.id);
        res.render('venues/show', {
            title: venue.VenueName,
            venue,
            googleMapsApiKey,
            concerts
        });
    }
    catch (err) {
        console.error('Error fetching venue:', err);
        res.status(500).render('500', { message: 'Server error' });
    }
}
