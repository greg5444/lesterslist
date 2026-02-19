// src/routes/festivalRoutes.js
import express from 'express';
import { listFestivals, showFestival } from '../controllers/festivalController.js';
const router = express.Router();
// GET /festivals (must be before :id route)
router.get('/', listFestivals);
// GET /festivals/:id
router.get('/:id', showFestival);
export default router;
