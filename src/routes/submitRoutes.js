// src/routes/submitRoutes.js
import express from 'express';
import {
  showSubmitHub,
  showFestivalForm, submitFestival,
  showBandForm,    submitBand,
  showCampForm,    submitCamp,
  showVenueForm,   submitVenue,
  showPhotosForm,  submitPhotos,
  showReportForm,  submitReport,
} from '../controllers/submitController.js';

const router = express.Router();

router.get('/',         showSubmitHub);

router.get('/festival', showFestivalForm);
router.post('/festival', submitFestival);

router.get('/band',     showBandForm);
router.post('/band',    submitBand);

router.get('/camp',     showCampForm);
router.post('/camp',    submitCamp);

router.get('/venue',    showVenueForm);
router.post('/venue',   submitVenue);

router.get('/photos',   showPhotosForm);
router.post('/photos',  submitPhotos);

export default router;

// Note: /report GET+POST are mounted separately in server.js at top level
// so that ?type=concert&id=123 links from any public page work cleanly.
