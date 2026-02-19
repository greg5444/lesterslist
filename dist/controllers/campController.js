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
async function listCamps(req, res) {
    try {
        const camps = await campModel_js_1.default.findAll();
        res.render('camps/index', { title: 'Camps & Workshops', camps });
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
        const imageUrl = camp.ImageURL && camp.ImageURL.trim() ? camp.ImageURL : constants_js_1.DEFAULT_IMAGE_URL;
        // Use GoogleMapAddress directly from Camps table
        const mapAddress = camp.GoogleMapAddress && camp.GoogleMapAddress.trim() ? camp.GoogleMapAddress : null;
        res.render('camps/show', {
            title: camp.EventName,
            camp,
            imageUrl,
            mapAddress,
            googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
        });
    }
    catch (err) {
        console.error('Error fetching camp:', err);
        res.status(500).render('500', { message: 'Server error' });
    }
}
