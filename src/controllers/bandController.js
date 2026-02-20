// src/controllers/bandController.js
import Band from '../models/bandModel.js';
import { DEFAULT_IMAGE_URL } from '../config/constants.js';

const IMAGE_BASE_URL = 'https://images.lesterslist.com/media/';

function resolveBandImage(pictureUrl) {
  if (!pictureUrl || pictureUrl.trim() === '') return DEFAULT_IMAGE_URL;
  if (/^https?:\/\//i.test(pictureUrl)) return pictureUrl;
  return IMAGE_BASE_URL + pictureUrl;
}

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
    const bandsWithImages = bands.map(band => ({
      ...band,
      imageUrl: resolveBandImage(band.PictureURL)
    }));
    
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
    const imageUrl = resolveBandImage(band.PictureURL);
    const concerts = await Band.findLinkedConcerts(req.params.id);
    res.render('bands/show', {
      title: band.BandName,
      band,
      imageUrl,
      concerts
    });
  } catch (err) {
    console.error('Error fetching band:', err);
    res.status(500).render('500', { message: 'Server error' });
  }
}
