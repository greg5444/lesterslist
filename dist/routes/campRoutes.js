// src/routes/campRoutes.js
import express from 'express';
import { listCamps, showCamp } from '../controllers/campController.js';
const router = express.Router();
// GET /camps
router.get('/', listCamps);
// GET /camps/:id
router.get('/:id', showCamp);
export default router;
