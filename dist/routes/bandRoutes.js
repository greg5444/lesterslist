// src/routes/bandRoutes.js
import express from 'express';
import { listBands, showBand } from '../controllers/bandController.js';
const router = express.Router();
// GET /bands (must be before :id route)
router.get('/', listBands);
// GET /bands/:id
router.get('/:id', showBand);
export default router;
