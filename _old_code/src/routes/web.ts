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
    router.get('/festivals', mainController.festivalsPage.bind(mainController));
    router.get('/camps', mainController.campsPage.bind(mainController));
    router.get('/jams', mainController.jamsPage.bind(mainController));
    router.get('/learn', mainController.learnPage.bind(mainController));
    router.get('/about', (req, res) => {
        res.render('about');
    });
    router.get('/contact', (req, res) => {
        res.render('contact');
    });

    app.use('/', router);
}