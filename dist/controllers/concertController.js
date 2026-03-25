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
const imageUtils_js_1 = require("../config/imageUtils.js");
async function listConcerts(req, res) {
    try {
        const currentView = req.query.view === 'list' ? 'list' : 'gallery';
        const currentPage = parseInt(req.query.page) || 1;
        const itemsPerPage = [30, 60].includes(parseInt(req.query.limit)) ? parseInt(req.query.limit) : 30;
        const offset = (currentPage - 1) * itemsPerPage;
        const filterState = req.query.state || '';
        const filterMonth = req.query.month || '';
        const lat = req.query.lat ? parseFloat(req.query.lat) : null;
        const lng = req.query.lng ? parseFloat(req.query.lng) : null;
        const radius = parseInt(req.query.radius) || 50;
        const filters = {
            state: filterState || null,
            month: filterMonth || null,
            lat,
            lng,
            radius
        };
        const [concerts, totalCount, filterOptions] = await Promise.all([
            concertModel_js_1.default.findUpcomingFiltered(itemsPerPage, offset, filters),
            concertModel_js_1.default.countUpcomingFiltered(filters),
            concertModel_js_1.default.getFilterOptions()
        ]);
        const totalPages = Math.ceil(totalCount / itemsPerPage);
        // Resolve image URLs for each concert
        const filteredConcerts = concerts.map(concert => {
            const concertImg = concert.ConcertImage;
            const bandImg = concert.BandPictureURL;
            const rawImageUrl = (concertImg && concertImg.trim().length > 5 ? (0, imageUtils_js_1.resolveImageUrl)(concertImg) : null)
                || (bandImg && bandImg.trim().length > 5 ? (0, imageUtils_js_1.resolveImageUrl)(bandImg) : null)
                || constants_js_1.DEFAULT_IMAGE_URL;
            const { url: imageUrl, alignment: imageAlignment } = (0, imageUtils_js_1.parseImageAlignment)(rawImageUrl);
            return { ...concert, imageUrl, imageAlignment };
        });
        // Handle AJAX request for Infinite Scroll
        if (req.query.ajax === '1' || req.xhr || (req.headers.accept || '').includes('application/json')) {
            return res.json({
                concerts: filteredConcerts,
                totalCount,
                totalPages,
                currentPage,
                itemsPerPage
            });
        }
        res.render('concerts/index', {
            title: 'Upcoming Concerts',
            concerts: filteredConcerts,
            currentView,
            currentPage,
            totalPages,
            totalCount,
            itemsPerPage,
            filterState,
            filterMonth,
            filterOptions
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
        const rawImageUrl = (concert.ConcertImage && concert.ConcertImage.trim().length > 5 ? (0, imageUtils_js_1.resolveImageUrl)(concert.ConcertImage) : null)
            || (concert.BandPictureURL && concert.BandPictureURL.trim().length > 5 ? (0, imageUtils_js_1.resolveImageUrl)(concert.BandPictureURL) : null)
            || constants_js_1.DEFAULT_IMAGE_URL;
        const { url: displayImage, alignment: imageAlignment } = (0, imageUtils_js_1.parseImageAlignment)(rawImageUrl);
        // Restructure flat SQL result into nested objects for view compatibility
        const structuredConcert = {
            ConcertNumber: concert.ConcertNumber,
            ConcertName: concert.ConcertName,
            ConcertDate: concert.ConcertDate,
            ConcertImage: concert.ConcertImage,
            ExtraDetail: concert.ExtraDetail || null,
            Street: concert.Street,
            City: concert.City,
            State: concert.State,
            Zip: concert.Zip,
            GoogleMapAddress: (0, imageUtils_js_1.sanitizeMapAddress)(concert.GoogleMapAddress, {
                Street: concert.Street, City: concert.City, State: concert.State, Zip: concert.Zip
            }),
            Band: concert.BandNumber ? {
                BandNumber: concert.BandNumber,
                BandName: concert.BandName,
                PictureURL: concert.BandPictureURL,
                BandWebsite: concert.BandWebsite
            } : null,
            Venue: concert.VenueNumber ? {
                VenueNumber: concert.VenueNumber,
                VenueName: concert.VenueName,
                Street: concert.Street,
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
            imageAlignment,
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
