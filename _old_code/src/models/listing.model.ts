export class ListingModel {
    id: number;
    title: string;
    description: string;
    price: number;
    createdAt: Date;
    updatedAt: Date;

    constructor(id: number, title: string, description: string, price: number, createdAt: Date, updatedAt: Date) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.price = price;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static fromDatabaseRow(row: any): ListingModel {
        return new ListingModel(
            row.id,
            row.title,
            row.description,
            row.price,
            row.created_at,
            row.updated_at
        );
    }

    // Additional methods for interacting with the database can be added here
}