import { Router } from 'express';
import ListingsController from '../controllers/listingsController';

const router = Router();
const listingsController = new ListingsController();

export function setWebRoutes(app) {
    router.get('/', listingsController.getAllListings);
    router.get('/listing/:id', listingsController.getListingById);
    router.get('/about', (req, res) => {
        res.render('about');
    });
    router.get('/contact', (req, res) => {
        res.render('contact');
    });

    app.use('/', router);
}