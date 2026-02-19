// src/controllers/festivalController.js
import Festival from '../models/festivalModel.js';
import { DEFAULT_IMAGE_URL } from '../config/constants.js';
const BAND_IMAGE_BASE = 'https://images.lesterslist.com/media/';
function resolveBandImage(pictureUrl) {
    if (!pictureUrl || pictureUrl.trim() === '')
        return DEFAULT_IMAGE_URL;
    if (/^https?:\/\//i.test(pictureUrl))
        return pictureUrl;
    return BAND_IMAGE_BASE + pictureUrl;
}
export async function listFestivals(req, res) {
    try {
        const currentView = req.query.view === 'list' ? 'list' : 'gallery';
        const currentPage = parseInt(req.query.page) || 1;
        const itemsPerPage = [25, 40, 55].includes(parseInt(req.query.limit)) ? parseInt(req.query.limit) : 25;
        const offset = (currentPage - 1) * itemsPerPage;
        const festivals = await Festival.findAllPaginated(itemsPerPage, offset);
        const totalCount = await Festival.countAll();
        const totalPages = Math.ceil(totalCount / itemsPerPage);
        res.render('festivals/index', {
            title: 'All Festivals',
            festivals,
            currentView,
            currentPage,
            totalPages,
            totalCount,
            itemsPerPage
        });
    }
    catch (err) {
        console.error('Error fetching festivals:', err);
        res.status(500).render('500', { message: 'Server error' });
    }
}
export async function showFestival(req, res) {
    try {
        const result = await Festival.findById(req.params.id);
        if (!result)
            return res.status(404).render('404', { message: 'Festival not found' });
        const { festival, bands } = result;
        // Hero image: FeaturedImageURL only, fallback to generic
        let heroImage = 'https://images.lesterslist.com/media/All-bluegrass.jpg';
        if (festival.FeaturedImageURL && festival.FeaturedImageURL.trim().length > 5) {
            heroImage = festival.FeaturedImageURL;
        }
        // Attach resolved image URLs to bands
        const bandsWithImages = bands.map(band => ({
            ...band,
            imageUrl: resolveBandImage(band.PictureURL)
        }));
        const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
        const mapAddress = festival.GoogleMapAddress && festival.GoogleMapAddress.trim()
            ? festival.GoogleMapAddress
            : [
                festival.VenueStreetAddress,
                festival.City,
                festival.State,
                festival.Zip
            ].filter(Boolean).join(', ');
        res.render('festivals/show', {
            title: festival.FestivalName,
            festival,
            heroImage,
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
