import { AuctionsService } from './auctions.service';
export declare class AuctionsController {
    private auctionsService;
    constructor(auctionsService: AuctionsService);
    getAll(): Promise<({
        listing: {
            title: string;
            make: string;
            model: string;
            location: string;
            basePrice: number;
            photos: string[];
        };
    } & {
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
    })[]>;
    getLive(): Promise<({
        listing: {
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
        };
    } & {
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
    })[]>;
    getOne(id: string): Promise<{
        liveState: {
            highestBid: number;
            timeRemaining: number;
            bidCount: number;
        };
        listing: {
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
        };
        bids: {
            id: string;
            auctionId: string;
            amount: number;
            isWinning: boolean;
            timestamp: Date;
            bidderId: string;
        }[];
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
    }>;
    schedule(body: {
        listingId: string;
        scheduledStart: string;
    }): Promise<{
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
    }>;
    testSchedule(listingId: string): Promise<{
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
    }>;
    goLive(id: string): Promise<{
        message: string;
        auctionId: string;
    }>;
    testGoLive(id: string): Promise<{
        message: string;
        auctionId: string;
    }>;
    payEmd(id: string, user: any, body: {
        razorpayPayId: string;
    }): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.EmdStatus;
        auctionId: string;
        userId: string;
        amount: number;
        razorpayPayId: string;
        depositedAt: Date;
        refundedAt: Date | null;
        forfeitedAt: Date | null;
    }>;
    emdStatus(id: string, user: any): Promise<{
        id: string;
        status: import(".prisma/client").$Enums.EmdStatus;
        auctionId: string;
        userId: string;
        amount: number;
        razorpayPayId: string;
        depositedAt: Date;
        refundedAt: Date | null;
        forfeitedAt: Date | null;
    }>;
    complete(id: string): Promise<{
        result: string;
        winnerId: string;
        finalPrice: number;
        paymentDeadline?: undefined;
    } | {
        result: string;
        winnerId: string;
        finalPrice: number;
        paymentDeadline: Date;
    }>;
}
