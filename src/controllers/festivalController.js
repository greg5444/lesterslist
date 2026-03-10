// src/controllers/festivalController.js
import Festival from '../models/festivalModel.js';
import { DEFAULT_IMAGE_URL } from '../config/constants.js';
import { resolveImageUrl, parseImageAlignment } from '../config/imageUtils.js';

export async function listFestivals(req, res) {
  try {
    const currentView = req.query.view === 'list' ? 'list' : 'gallery';
    const currentPage = parseInt(req.query.page) || 1;
    const itemsPerPage = [30, 60].includes(parseInt(req.query.limit)) ? parseInt(req.query.limit) : 30;
    const offset = (currentPage - 1) * itemsPerPage;
    
    const festivals = await Festival.findAllPaginated(itemsPerPage, offset);
    const totalCount = await Festival.countAll();
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    
    // Attach resolved image URLs and alignment to each festival
    const festivalsWithImages = festivals.map(festival => {
      const rawUrl = (festival.FestivalFlyerURL && festival.FestivalFlyerURL.length > 5) 
        ? resolveImageUrl(festival.FestivalFlyerURL) 
        : (festival.FeaturedImageURL && festival.FeaturedImageURL.length > 5 
           ? resolveImageUrl(festival.FeaturedImageURL) 
           : DEFAULT_IMAGE_URL);
      
      const { url: imageUrl, alignment: imageAlignment } = parseImageAlignment(rawUrl);
      return { ...festival, imageUrl, imageAlignment };
    });

    res.render('festivals/index', {
      title: 'All Festivals',
      festivals: festivalsWithImages,
      currentView,
      currentPage,
      totalPages,
      totalCount,
      itemsPerPage
    });
  } catch (err) {
    console.error('Error fetching festivals:', err);
    res.status(500).render('500', { message: 'Server error' });
  }
}

export async function showFestival(req, res) {
  try {
    const result = await Festival.findById(req.params.id);
    if (!result) return res.status(404).render('404', { message: 'Festival not found' });
    const { festival, bands } = result;
    
    // Hero image logic: extract alignment
    const rawHeroUrl = (festival.FeaturedImageURL && festival.FeaturedImageURL.trim().length > 5)
      ? resolveImageUrl(festival.FeaturedImageURL)
      : 'https://images.lesterslist.com/media/All-bluegrass.jpg';
      
    const { url: heroImage, alignment: imageAlignment } = parseImageAlignment(rawHeroUrl);
    
    // Attach resolved image URLs and alignment to bands
    const bandsWithImages = bands.map(band => {
      const { url: imageUrl, alignment: bandImageAlignment } = parseImageAlignment(resolveImageUrl(band.PictureURL));
      return {
        ...band,
        imageUrl,
        imageAlignment: bandImageAlignment
      };
    });
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    // Determine the map address: prefer non-URL strings
    let mapAddress = festival.GoogleMapAddress && festival.GoogleMapAddress.trim()
      ? festival.GoogleMapAddress
      : [
          festival.Street,
          festival.City,
          festival.State,
          festival.Zip
        ].filter(Boolean).join(', ');
    
    // If mapAddress looks like a CID URL (e.g. from a Venue), fallback to structured address
    if (mapAddress && (mapAddress.includes('http') || mapAddress.includes('cid='))) {
      mapAddress = [
        festival.Street,
        festival.City,
        festival.State,
        festival.Zip
      ].filter(Boolean).join(', ');
    }

    res.render('festivals/show', {
      title: festival.FestivalName,
      festival,
      heroImage,
      imageAlignment,
      bands: bandsWithImages,
      googleMapsApiKey,
      mapAddress
    });
  } catch (err) {
    console.error('Error fetching festival:', err);
    res.status(500).render('500', { message: 'Server error' });
  }
}
