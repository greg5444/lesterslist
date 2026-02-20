// src/routes/jamRoutes.js
import express from 'express';
import { listJams, showJamForm, submitJam } from '../controllers/jamController.js';

const router = express.Router();


import { showJamDetail } from '../controllers/jamController.js';

router.get('/', listJams);
router.get('/new', showJamForm);
router.post('/new', submitJam);
router.get('/:JamID', showJamDetail);

export default router;
