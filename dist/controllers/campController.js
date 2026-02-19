// src/controllers/campController.js
import Camp from '../models/campModel.js';
import { DEFAULT_IMAGE_URL } from '../config/constants.js';
export async function listCamps(req, res) {
    try {
        const camps = await Camp.findAll();
        res.render('camps/index', { title: 'Camps & Workshops', camps });
    }
    catch (err) {
        console.error('Error fetching camps:', err);
        res.status(500).render('500', { message: 'Server error' });
    }
}
export async function showCamp(req, res) {
    try {
        const camp = await Camp.findById(req.params.id);
        if (!camp)
            return res.status(404).render('404', { message: 'Camp/Workshop not found' });
        const imageUrl = camp.ImageURL && camp.ImageURL.trim() ? camp.ImageURL : DEFAULT_IMAGE_URL;
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
