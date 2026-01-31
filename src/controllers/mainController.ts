import { getAllBands } from '../models/bands';
import { getAllConcerts } from '../models/concerts';

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
}
