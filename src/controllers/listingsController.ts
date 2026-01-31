export class ListingsController {
    async createListing(req, res) {
        res.status(501).send('Not implemented');
    }

    async getListing(req, res) {
        res.status(501).send('Not implemented');
    }

    async updateListing(req, res) {
        res.status(501).send('Not implemented');
    }

    async deleteListing(req, res) {
        res.status(501).send('Not implemented');
    }

    async getAllListings(req, res) {
        // Render homepage with navigation and logo
        res.render('index', { logo: '/img/logo.png' });
    }
}