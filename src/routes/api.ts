import { Router } from 'express';
import ListingsController from '../controllers/listingsController';
import AuthController from '../controllers/authController';

const router = Router();
const listingsController = new ListingsController();
const authController = new AuthController();

export function setApiRoutes(app) {
    router.get('/listings', listingsController.getAllListings.bind(listingsController));
    router.post('/listings', listingsController.createListing.bind(listingsController));
    router.get('/listings/:id', listingsController.getListingById.bind(listingsController));
    router.put('/listings/:id', listingsController.updateListing.bind(listingsController));
    router.delete('/listings/:id', listingsController.deleteListing.bind(listingsController));

    router.post('/auth/login', authController.login.bind(authController));
    router.post('/auth/register', authController.register.bind(authController));

    app.use('/api', router);
}