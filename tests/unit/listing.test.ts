import { ListingService } from '../../src/services/listingService';
import { ListingModel } from '../../src/models/listing.model';

describe('ListingService', () => {
    let listingService: ListingService;

    beforeEach(() => {
        listingService = new ListingService();
    });

    describe('createListing', () => {
        it('should create a new listing', async () => {
            const listingData = { title: 'Test Listing', description: 'Test Description' };
            const createdListing = await listingService.createListing(listingData);
            expect(createdListing).toHaveProperty('id');
            expect(createdListing.title).toBe(listingData.title);
        });
    });

    describe('getListing', () => {
        it('should return a listing by ID', async () => {
            const listing = await listingService.createListing({ title: 'Test Listing', description: 'Test Description' });
            const fetchedListing = await listingService.getListing(listing.id);
            expect(fetchedListing.id).toBe(listing.id);
        });
    });

    describe('updateListing', () => {
        it('should update an existing listing', async () => {
            const listing = await listingService.createListing({ title: 'Test Listing', description: 'Test Description' });
            const updatedData = { title: 'Updated Listing' };
            const updatedListing = await listingService.updateListing(listing.id, updatedData);
            expect(updatedListing.title).toBe(updatedData.title);
        });
    });

    describe('deleteListing', () => {
        it('should delete a listing', async () => {
            const listing = await listingService.createListing({ title: 'Test Listing', description: 'Test Description' });
            await listingService.deleteListing(listing.id);
            const deletedListing = await listingService.getListing(listing.id);
            expect(deletedListing).toBeNull();
        });
    });
});