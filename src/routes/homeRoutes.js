// src/routes/homeRoutes.js
import express from 'express';
import { showHome, showContact, showAbout } from '../controllers/homeController.js';

const router = express.Router();

router.get('/', showHome);
router.get('/contact', showContact);
router.get('/about', showAbout);

export default router;
