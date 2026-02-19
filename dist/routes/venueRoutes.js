// src/routes/venueRoutes.js
import express from 'express';
import { showVenue } from '../controllers/venueController.js';
const router = express.Router();
// GET /venues/:id
router.get('/:id', showVenue);
export default router;
