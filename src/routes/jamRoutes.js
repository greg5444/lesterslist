// src/routes/jamRoutes.js
import express from 'express';
import { listJams, showJamForm, submitJam } from '../controllers/jamController.js';

const router = express.Router();

router.get('/', listJams);
router.get('/new', showJamForm);
router.post('/new', submitJam);

export default router;
