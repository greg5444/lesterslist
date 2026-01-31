import { Router } from 'express';

import ListingsController from '../controllers/listingsController';
import { MainController } from '../controllers/mainController';

const router = Router();

const listingsController = new ListingsController();
const mainController = new MainController();

export function setWebRoutes(app) {
    router.get('/', listingsController.getAllListings);
    router.get('/listing/:id', listingsController.getListingById);

    router.get('/bands', mainController.bandsPage.bind(mainController));
    router.get('/concerts', mainController.concertsPage.bind(mainController));
    router.get('/festivals', (req, res) => {
        res.render('festivals');
    });
    router.get('/camps', (req, res) => {
        res.render('camps');
    });
    router.get('/jams', (req, res) => {
        res.render('jams');
    });
    router.get('/learn', (req, res) => {
        res.render('learn');
    });
    router.get('/about', (req, res) => {
        res.render('about');
    });
    router.get('/contact', (req, res) => {
        res.render('contact');
    });

    app.use('/', router);
}