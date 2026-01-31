
import { getAllBands } from '../models/bands';
import { getAllConcerts } from '../models/concerts';
import { getAllFestivals } from '../models/festivals';
import { getAllCamps } from '../models/camps';
import { getAllJams } from '../models/jams';
import { getAllLearnToPlay } from '../models/learns';

export class MainController {
  async bandsPage(req, res) {
    try {
      const bands = await getAllBands();
      res.render('bands', { bands, logo: '/img/logo.png' });
    } catch (err) {
      res.render('bands', { bands: [], logo: '/img/logo.png', error: 'Error loading bands.' });
    }
  }

  async concertsPage(req, res) {
    try {
      const concerts = await getAllConcerts();
      res.render('concerts', { concerts, logo: '/img/logo.png' });
    } catch (err) {
      res.render('concerts', { concerts: [], logo: '/img/logo.png', error: 'Error loading concerts.' });
    }
  }

  async festivalsPage(req, res) {
    try {
      const festivals = await getAllFestivals();
      res.render('festivals', { festivals, logo: '/img/logo.png' });
    } catch (err) {
      res.render('festivals', { festivals: [], logo: '/img/logo.png', error: 'Error loading festivals.' });
    }
  }

  async campsPage(req, res) {
    try {
      const camps = await getAllCamps();
      res.render('camps', { camps, logo: '/img/logo.png' });
    } catch (err) {
      res.render('camps', { camps: [], logo: '/img/logo.png', error: 'Error loading camps.' });
    }
  }

  async jamsPage(req, res) {
    try {
      const jams = await getAllJams();
      res.render('jams', { jams, logo: '/img/logo.png' });
    } catch (err) {
      res.render('jams', { jams: [], logo: '/img/logo.png', error: 'Error loading jams.' });
    }
  }

  async learnPage(req, res) {
    try {
      const learn = await getAllLearnToPlay();
      res.render('learn', { learn, logo: '/img/logo.png' });
    } catch (err) {
      res.render('learn', { learn: [], logo: '/img/logo.png', error: 'Error loading resources.' });
    }
  }
}
