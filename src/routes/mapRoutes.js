// src/routes/mapRoutes.js
import express from 'express';
import { showMap } from '../controllers/mapController.js';

const router = express.Router();

// GET /map - Events map view
router.get('/', showMap);

export default router;
