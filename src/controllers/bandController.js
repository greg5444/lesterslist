// src/controllers/bandController.js
import Band from '../models/bandModel.js';
import { DEFAULT_IMAGE_URL } from '../config/constants.js';
import { resolveImageUrl, parseImageAlignment } from '../config/imageUtils.js';

export async function listBands(req, res) {
  try {
    const letter = req.query.letter || 'All';
    const currentView = req.query.view === 'list' ? 'list' : 'gallery';
    const currentPage = parseInt(req.query.page) || 1;
    const itemsPerPage = [30, 60].includes(parseInt(req.query.limit)) ? parseInt(req.query.limit) : 30;
    const offset = (currentPage - 1) * itemsPerPage;
    
    // Validate letter parameter (must be A-Z or "All")
    if (letter !== 'All' && !/^[A-Z]$/.test(letter)) {
      return res.redirect('/bands');
    }
    
    // Fetch bands and count based on filter
    let bands, totalCount;
    if (letter === 'All') {
      bands = await Band.findAllPaginated(itemsPerPage, offset);
      totalCount = await Band.countAll();
    } else {
      bands = await Band.findByLetterPaginated(letter, itemsPerPage, offset);
      totalCount = await Band.countByLetter(letter);
    }
    
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    
    // Attach resolved image URLs to each band
    const bandsWithImages = bands.map(band => {
      const { url: imageUrl, alignment: imageAlignment } = parseImageAlignment(resolveImageUrl(band.PictureURL));
      return {
        ...band,
        imageUrl,
        imageAlignment
      };
    });
    
    res.render('bands/index', {
      title: letter === 'All' ? 'All Bands' : `Bands Starting with ${letter}`,
      bands: bandsWithImages,
      currentLetter: letter,
      currentView,
      currentPage,
      totalPages,
      totalCount,
      itemsPerPage
    });
  } catch (err) {
    console.error('Error fetching bands:', err);
    res.status(500).render('500', { message: 'Server error' });
  }
}

export async function showBand(req, res) {
  try {
    const band = await Band.findById(req.params.id);
    if (!band) return res.status(404).render('404', { message: 'Band not found' });
    const { url: imageUrl, alignment: imageAlignment } = parseImageAlignment(resolveImageUrl(band.PictureURL));
    const concerts = await Band.findLinkedConcerts(req.params.id);
    // Band detail map: all appearances with valid coordinates (stored directly on Venues)
    const allAppearances = await Band.findAllAppearancesWithCoords(req.params.id);
    const mapData = allAppearances.filter(a => a.Latitude && a.Longitude);
    const missingCoords = allAppearances.filter(a => !a.Latitude || !a.Longitude);
    if (missingCoords.length > 0) {
      console.log(`Band ${req.params.id} missing coordinates for ${missingCoords.length} appearances:`);
      missingCoords.forEach(a => console.log(`- ${a.VenueName} (${a.date})`));
    }
    res.render('bands/show', {
      title: band.BandName,
      band,
      imageUrl,
      imageAlignment,
      concerts,
      mapData,
      GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY
    });
  } catch (err) {
    console.error('Error fetching band:', err);
    res.status(500).render('500', { message: 'Server error' });
  }
}
