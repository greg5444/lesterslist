import request from 'supertest';
import app from '../../src/app';

describe('API Integration Tests', () => {
    it('should return a list of listings', async () => {
        const response = await request(app).get('/api/listings');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('should create a new listing', async () => {
        const newListing = {
            title: 'Test Listing',
            description: 'This is a test listing.',
            price: 100,
        };

        const response = await request(app)
            .post('/api/listings')
            .send(newListing);

        expect(response.status).toBe(201);
        expect(response.body.title).toBe(newListing.title);
    });

    it('should return a single listing by ID', async () => {
        const response = await request(app).get('/api/listings/1');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id', 1);
    });

    it('should update a listing', async () => {
        const updatedListing = {
            title: 'Updated Listing',
            description: 'This is an updated test listing.',
            price: 150,
        };

        const response = await request(app)
            .put('/api/listings/1')
            .send(updatedListing);

        expect(response.status).toBe(200);
        expect(response.body.title).toBe(updatedListing.title);
    });

    it('should delete a listing', async () => {
        const response = await request(app).delete('/api/listings/1');
        expect(response.status).toBe(204);
    });
});