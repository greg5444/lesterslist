import { Router } from 'express';
import ListingsController from '../controllers/listingsController';

const router = Router();
const listingsController = new ListingsController();

export function setWebRoutes(app) {
    router.get('/', listingsController.getAllListings);
    router.get('/listing/:id', listingsController.getListingById);

    router.get('/bands', (req, res) => {
        res.render('bands');
    });
    router.get('/concerts', (req, res) => {
        res.render('concerts');
    });
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