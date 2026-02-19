// src/routes/learnRoutes.js
import express from 'express';
import { listLearn, showLearnForm, submitLearn } from '../controllers/learnController.js';

const router = express.Router();

router.get('/', listLearn);
router.get('/new', showLearnForm);
router.post('/new', submitLearn);

export default router;
