// src/controllers/venueController.js
import Venue from '../models/venueModel.js';

export async function showVenue(req, res) {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).render('404', { message: 'Venue not found' });
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    const concerts = await Venue.findLinkedConcerts(req.params.id);
    res.render('venues/show', {
      title: venue.VenueName,
      venue,
      googleMapsApiKey,
      concerts
    });
  } catch (err) {
    console.error('Error fetching venue:', err);
    res.status(500).render('500', { message: 'Server error' });
  }
}
