"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showVenue = showVenue;
// src/controllers/venueController.js
const venueModel_js_1 = __importDefault(require("../models/venueModel.js"));
const imageUtils_js_1 = require("../config/imageUtils.js");
async function showVenue(req, res) {
    try {
        const venue = await venueModel_js_1.default.findById(req.params.id);
        if (!venue)
            return res.status(404).render('404', { message: 'Venue not found' });
        const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
        const concerts = await venueModel_js_1.default.findLinkedConcerts(req.params.id);
        const mapAddress = (0, imageUtils_js_1.sanitizeMapAddress)(venue.GoogleMapAddress, {
            Street: venue.Street, City: venue.City, State: venue.State, Zip: venue.Zip
        });
        res.render('venues/show', {
            title: venue.VenueName,
            venue,
            mapAddress,
            googleMapsApiKey,
            concerts
        });
    }
    catch (err) {
        console.error('Error fetching venue:', err);
        res.status(500).render('500', { message: 'Server error' });
    }
}
