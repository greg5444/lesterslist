// src/controllers/concertController.js
import Concert from '../models/concertModel.js';
import { DEFAULT_IMAGE_URL } from '../config/constants.js';

const IMAGE_BASE_URL = 'https://images.lesterslist.com/media/';

function resolveBandImage(pictureUrl) {
  if (!pictureUrl || pictureUrl.trim() === '') return DEFAULT_IMAGE_URL;
  if (/^https?:\/\//i.test(pictureUrl)) return pictureUrl;
  return IMAGE_BASE_URL + pictureUrl;
}

function normalizeImageUrl(url) {
  if (!url || url.trim() === '') return null;
  // Fix old WordPress paths → CDN paths
  url = url.replace('/wp-content/media/', '/media/');
  // Remove WordPress -scaled suffix (e.g. image-scaled.jpg → image.jpg)
  url = url.replace(/-scaled(\.[a-zA-Z]+)$/, '$1');
  return url;
}

export async function listConcerts(req, res) {
  try {
    const currentView = req.query.view === 'list' ? 'list' : 'gallery';
    const currentPage = parseInt(req.query.page) || 1;
    const itemsPerPage = [30, 60].includes(parseInt(req.query.limit)) ? parseInt(req.query.limit) : 30;
    const offset = (currentPage - 1) * itemsPerPage;

    const concerts = await Concert.findUpcomingPaginated(itemsPerPage, offset);
    const totalCount = await Concert.countUpcoming();
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // Resolve image URLs for each concert
    const concertsWithImages = concerts.map(concert => {
      const concertImg = normalizeImageUrl(concert.ConcertImage);
      const bandImg = concert.BandPictureURL ? resolveBandImage(normalizeImageUrl(concert.BandPictureURL)) : null;
      const imageUrl = (concertImg && concertImg.length > 5 ? concertImg : null)
        || (bandImg && bandImg.length > 5 ? bandImg : null)
        || DEFAULT_IMAGE_URL;
      return { ...concert, imageUrl };
    });

    res.render('concerts/index', {
      title: 'Upcoming Concerts',
      concerts: concertsWithImages,
      currentView,
      currentPage,
      totalPages,
      totalCount,
      itemsPerPage
    });
  } catch (err) {
    console.error('Error fetching concerts:', err);
    res.status(500).render('500', { message: 'Server error' });
  }
}

export async function showConcert(req, res) {
  try {
    const concert = await Concert.findById(req.params.id);
    if (!concert) return res.status(404).render('404', { message: 'Concert not found' });
    
    // Explicit Image Fallback Logic (Priority Order)
    const concertImg = normalizeImageUrl(concert.ConcertImage);
    const bandImg = concert.BandPictureURL ? resolveBandImage(normalizeImageUrl(concert.BandPictureURL)) : null;
    const displayImage = (concertImg && concertImg.length > 5 ? concertImg : null)
      || (bandImg && bandImg.length > 5 ? bandImg : null)
      || DEFAULT_IMAGE_URL;
    
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
  } catch (err) {
    console.error('Error fetching concert:', err);
    res.status(500).render('500', { message: 'Server error' });
  }
}
