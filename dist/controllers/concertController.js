"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listConcerts = listConcerts;
exports.showConcert = showConcert;
// src/controllers/concertController.js
const concertModel_js_1 = __importDefault(require("../models/concertModel.js"));
const constants_js_1 = require("../config/constants.js");
async function listConcerts(req, res) {
    try {
        const currentView = req.query.view === 'list' ? 'list' : 'gallery';
        const currentPage = parseInt(req.query.page) || 1;
        const itemsPerPage = [25, 40, 55].includes(parseInt(req.query.limit)) ? parseInt(req.query.limit) : 25;
        const offset = (currentPage - 1) * itemsPerPage;
        const concerts = await concertModel_js_1.default.findUpcomingPaginated(itemsPerPage, offset);
        const totalCount = await concertModel_js_1.default.countUpcoming();
        const totalPages = Math.ceil(totalCount / itemsPerPage);
        res.render('concerts/index', {
            title: 'Upcoming Concerts',
            concerts,
            currentView,
            currentPage,
            totalPages,
            totalCount,
            itemsPerPage
        });
    }
    catch (err) {
        console.error('Error fetching concerts:', err);
        res.status(500).render('500', { message: 'Server error' });
    }
}
async function showConcert(req, res) {
    try {
        const concert = await concertModel_js_1.default.findById(req.params.id);
        if (!concert)
            return res.status(404).render('404', { message: 'Concert not found' });
        // Explicit Image Fallback Logic (Priority Order)
        let displayImage = 'https://images.lesterslist.com/media/All-bluegrass.jpg'; // Default
        // Priority 1: Specific Concert Poster
        if (concert.ConcertImage && concert.ConcertImage.length > 5) {
            displayImage = concert.ConcertImage;
        }
        // Priority 2: Band Profile Photo
        else if (concert.BandPictureURL && concert.BandPictureURL.length > 5) {
            displayImage = concert.BandPictureURL;
        }
        console.log('=== Concert Image Debug ===');
        console.log('Concert Number:', concert.ConcertNumber);
        console.log('Concert Name:', concert.ConcertName);
        console.log('ConcertImage:', concert.ConcertImage);
        console.log('BandPictureURL:', concert.BandPictureURL);
        console.log('Final displayImage:', displayImage);
        console.log('=== End Debug ===');
        // Restructure flat SQL result into nested objects for view compatibility
        const structuredConcert = {
            ConcertNumber: concert.ConcertNumber,
            ConcertName: concert.ConcertName,
            ConcertDate: concert.ConcertDate,
            ConcertImage: concert.ConcertImage,
            VenueStreetAddress: concert.VenueStreetAddress,
            City: concert.City,
            State: concert.State,
            Zip: concert.Zip,
            GoogleMapAddress: concert.GoogleMapAddress,
            Band: concert.BandNumber ? {
                BandNumber: concert.BandNumber,
                BandName: concert.BandName,
                PictureURL: concert.BandPictureURL,
                BandWebsite: concert.BandWebsite
            } : null,
            Venue: concert.VenueNumber ? {
                VenueNumber: concert.VenueNumber,
                VenueName: concert.VenueName,
                VenueStreetAddress: concert.VenueStreetAddress,
                City: concert.City,
                State: concert.State,
                Zip: concert.Zip,
                GoogleMapAddress: concert.GoogleMapAddress
            } : null,
            Festival: concert.FestivalNumber ? {
                FestivalNumber: concert.FestivalNumber,
                FestivalName: concert.FestivalName
            } : null
        };
        // Parse date for badge overlay
        const concertDate = new Date(concert.ConcertDate);
        const concertMonth = concertDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
        const concertDay = concertDate.getDate();
        const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
        res.render('concerts/show', {
            title: concert.ConcertName,
            concert: structuredConcert,
            displayImage,
            concertMonth,
            concertDay,
            googleMapsApiKey
        });
    }
    catch (err) {
        console.error('Error fetching concert:', err);
        res.status(500).render('500', { message: 'Server error' });
    }
}
