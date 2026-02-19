// src/routes/concertRoutes.js
import express from 'express';
import { listConcerts, showConcert } from '../controllers/concertController.js';

const router = express.Router();

// GET /concerts (must be before :id route)
router.get('/', listConcerts);

// GET /concerts/:id
router.get('/:id', showConcert);

export default router;
