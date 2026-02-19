// src/routes/homeRoutes.js
import express from 'express';
import { showHome, showContact } from '../controllers/homeController.js';

const router = express.Router();

router.get('/', showHome);
router.get('/contact', showContact);

export default router;
