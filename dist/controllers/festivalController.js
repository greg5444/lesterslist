"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFestivals = listFestivals;
exports.showFestival = showFestival;
// src/controllers/festivalController.js
const festivalModel_js_1 = __importDefault(require("../models/festivalModel.js"));
const constants_js_1 = require("../config/constants.js");
const imageUtils_js_1 = require("../config/imageUtils.js");
async function listFestivals(req, res) {
    try {
        const currentView = req.query.view === 'list' ? 'list' : 'grid';
        const currentPage = parseInt(req.query.page) || 1;
        const itemsPerPage = 30;
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
        const [festivals, totalCount, filterOptions] = await Promise.all([
            festivalModel_js_1.default.findUpcomingFiltered(itemsPerPage, offset, filters),
            festivalModel_js_1.default.countUpcomingFiltered(filters),
            festivalModel_js_1.default.getFilterOptions()
        ]);
        const totalPages = Math.ceil(totalCount / itemsPerPage);
        const festivalsWithImages = festivals.map(festival => {
            const hasImage = (festival.FestivalFlyerURL && festival.FestivalFlyerURL.trim().length > 5)
                || (festival.FeaturedImageURL && festival.FeaturedImageURL.trim().length > 5);
            const rawUrl = hasImage
                ? (0, imageUtils_js_1.resolveImageUrl)(festival.FestivalFlyerURL && festival.FestivalFlyerURL.trim().length > 5
                    ? festival.FestivalFlyerURL : festival.FeaturedImageURL)
                : constants_js_1.DEFAULT_IMAGE_URL;
            const { url: imageUrl, alignment: imageAlignment } = (0, imageUtils_js_1.parseImageAlignment)(rawUrl);
            const displayName = festival.FestivalName.replace(/\s+\d{4}$/, '').trim();
            const dateRangeParts = festival.DateRange ? festival.DateRange.split(' - ') : [];
            return { ...festival, FestivalName: displayName, dateRangeParts, imageUrl, imageAlignment, hasImage };
        });
        if (req.xhr || req.query.ajax === '1') {
            return res.json({
                festivals: festivalsWithImages,
                totalCount,
                totalPages,
                currentPage,
                itemsPerPage
            });
        }
        res.render('festivals/index', {
            title: 'Music Festivals',
            festivals: festivalsWithImages,
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
        console.error('Error fetching festivals:', err);
        res.status(500).render('500', { message: 'Server error' });
    }
}
async function showFestival(req, res) {
    try {
        const result = await festivalModel_js_1.default.findById(req.params.id);
        if (!result)
            return res.status(404).render('404', { message: 'Festival not found' });
        const { festival, bands } = result;
        // Hero image logic: extract alignment
        const rawHeroUrl = (festival.FeaturedImageURL && festival.FeaturedImageURL.trim().length > 5)
            ? (0, imageUtils_js_1.resolveImageUrl)(festival.FeaturedImageURL)
            : 'https://images.lesterslist.com/media/All-bluegrass.jpg';
        const { url: heroImage, alignment: imageAlignment } = (0, imageUtils_js_1.parseImageAlignment)(rawHeroUrl);
        // Attach resolved image URLs and alignment to bands
        const bandsWithImages = bands.map(band => {
            const { url: imageUrl, alignment: bandImageAlignment } = (0, imageUtils_js_1.parseImageAlignment)((0, imageUtils_js_1.resolveImageUrl)(band.PictureURL));
            return {
                ...band,
                imageUrl,
                imageAlignment: bandImageAlignment
            };
        });
        const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
        const mapAddress = (0, imageUtils_js_1.sanitizeMapAddress)(festival.GoogleMapAddress, festival);
        res.render('festivals/show', {
            title: festival.FestivalName,
            festival,
            heroImage,
            imageAlignment,
            bands: bandsWithImages,
            googleMapsApiKey,
            mapAddress
        });
    }
    catch (err) {
        console.error('Error fetching festival:', err);
        res.status(500).render('500', { message: 'Server error' });
    }
}
