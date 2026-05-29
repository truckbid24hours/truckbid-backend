import { ListingsService } from './listings.service';
export declare class ListingsController {
    private listingsService;
    constructor(listingsService: ListingsService);
    getAll(filters: any): Promise<({
        auction: {
            status: import(".prisma/client").$Enums.AuctionStatus;
            scheduledStart: Date;
            scheduledEnd: Date;
        };
        seller: {
            fullName: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        make: string;
        model: string;
        year: number;
        kmDriven: number;
        location: string;
        basePrice: number;
        description: string;
        photos: string[];
        rcDocument: string | null;
        listingFeePaid: boolean;
        listingFeeTxnId: string | null;
        status: import(".prisma/client").$Enums.ListingStatus;
        sellerId: string;
    })[]>;
    getPending(): Promise<({
        seller: {
            fullName: string;
            phone: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        make: string;
        model: string;
        year: number;
        kmDriven: number;
        location: string;
        basePrice: number;
        description: string;
        photos: string[];
        rcDocument: string | null;
        listingFeePaid: boolean;
        listingFeeTxnId: string | null;
        status: import(".prisma/client").$Enums.ListingStatus;
        sellerId: string;
    })[]>;
    getMy(user: any): Promise<({
        auction: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.AuctionStatus;
            listingId: string;
            scheduledStart: Date;
            scheduledEnd: Date;
            actualStart: Date | null;
            actualEnd: Date | null;
            reserveMet: boolean;
            winningBidId: string | null;
            winningBidderId: string | null;
            finalPrice: number | null;
            extensionCount: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        make: string;
        model: string;
        year: number;
        kmDriven: number;
        location: string;
        basePrice: number;
        description: string;
        photos: string[];
        rcDocument: string | null;
        listingFeePaid: boolean;
        listingFeeTxnId: string | null;
        status: import(".prisma/client").$Enums.ListingStatus;
        sellerId: string;
    })[]>;
    getOne(id: string): Promise<{
        auction: {
            id: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.AuctionStatus;
            listingId: string;
            scheduledStart: Date;
            scheduledEnd: Date;
            actualStart: Date | null;
            actualEnd: Date | null;
            reserveMet: boolean;
            winningBidId: string | null;
            winningBidderId: string | null;
            finalPrice: number | null;
            extensionCount: number;
        };
        seller: {
            fullName: string;
            id: string;
            createdAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        make: string;
        model: string;
        year: number;
        kmDriven: number;
        location: string;
        basePrice: number;
        description: string;
        photos: string[];
        rcDocument: string | null;
        listingFeePaid: boolean;
        listingFeeTxnId: string | null;
        status: import(".prisma/client").$Enums.ListingStatus;
        sellerId: string;
    }>;
    create(user: any, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        make: string;
        model: string;
        year: number;
        kmDriven: number;
        location: string;
        basePrice: number;
        description: string;
        photos: string[];
        rcDocument: string | null;
        listingFeePaid: boolean;
        listingFeeTxnId: string | null;
        status: import(".prisma/client").$Enums.ListingStatus;
        sellerId: string;
    }>;
    testApprove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        make: string;
        model: string;
        year: number;
        kmDriven: number;
        location: string;
        basePrice: number;
        description: string;
        photos: string[];
        rcDocument: string | null;
        listingFeePaid: boolean;
        listingFeeTxnId: string | null;
        status: import(".prisma/client").$Enums.ListingStatus;
        sellerId: string;
    }>;
    update(id: string, user: any, body: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        make: string;
        model: string;
        year: number;
        kmDriven: number;
        location: string;
        basePrice: number;
        description: string;
        photos: string[];
        rcDocument: string | null;
        listingFeePaid: boolean;
        listingFeeTxnId: string | null;
        status: import(".prisma/client").$Enums.ListingStatus;
        sellerId: string;
    }>;
    addPhotos(id: string, user: any, body: {
        urls: string[];
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        make: string;
        model: string;
        year: number;
        kmDriven: number;
        location: string;
        basePrice: number;
        description: string;
        photos: string[];
        rcDocument: string | null;
        listingFeePaid: boolean;
        listingFeeTxnId: string | null;
        status: import(".prisma/client").$Enums.ListingStatus;
        sellerId: string;
    }>;
    approve(id: string, body: {
        approved: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        make: string;
        model: string;
        year: number;
        kmDriven: number;
        location: string;
        basePrice: number;
        description: string;
        photos: string[];
        rcDocument: string | null;
        listingFeePaid: boolean;
        listingFeeTxnId: string | null;
        status: import(".prisma/client").$Enums.ListingStatus;
        sellerId: string;
    }>;
    feePaid(id: string, body: {
        txnId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        make: string;
        model: string;
        year: number;
        kmDriven: number;
        location: string;
        basePrice: number;
        description: string;
        photos: string[];
        rcDocument: string | null;
        listingFeePaid: boolean;
        listingFeeTxnId: string | null;
        status: import(".prisma/client").$Enums.ListingStatus;
        sellerId: string;
    }>;
}
