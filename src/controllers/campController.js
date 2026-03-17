// src/controllers/campController.js
import Camp from '../models/campModel.js';
import { DEFAULT_IMAGE_URL } from '../config/constants.js';
import { resolveImageUrl, parseImageAlignment, sanitizeMapAddress } from '../config/imageUtils.js';

export async function listCamps(req, res) {
  try {
    const camps = await Camp.findAll();
    const campsWithImages = camps.map(camp => {
      const { url: imageUrl, alignment: imageAlignment } = parseImageAlignment(resolveImageUrl(camp.ImageURL));
      return { ...camp, imageUrl, imageAlignment };
    });
    res.render('camps/index', { title: 'Camps & Workshops', camps: campsWithImages });
  } catch (err) {
    console.error('Error fetching camps:', err);
    res.status(500).render('500', { message: 'Server error' });
  }
}

export async function showCamp(req, res) {
  try {
    const camp = await Camp.findById(req.params.id);
    if (!camp) return res.status(404).render('404', { message: 'Camp/Workshop not found' });
    const { url: imageUrl, alignment: imageAlignment } = parseImageAlignment(resolveImageUrl(camp.ImageURL));
    
    // Sanitize GoogleMapAddress — reject URLs and q=place: junk
    const mapAddress = sanitizeMapAddress(camp.GoogleMapAddress, camp);
    
    res.render('camps/show', {
      title: camp.EventName,
      camp,
      imageUrl,
      imageAlignment,
      mapAddress,
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
    });
  } catch (err) {
    console.error('Error fetching camp:', err);
    res.status(500).render('500', { message: 'Server error' });
  }
}
