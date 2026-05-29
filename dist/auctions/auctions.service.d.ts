import { PrismaService } from '../prisma/prisma.service';
import { AuctionGateway } from '../gateway/auction.gateway';
export declare class AuctionsService {
    private prisma;
    private auctionGateway;
    constructor(prisma: PrismaService, auctionGateway: AuctionGateway);
    schedule(listingId: string, scheduledStart: string): Promise<{
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
    goLive(auctionId: string): Promise<{
        message: string;
        auctionId: string;
    }>;
    payEmd(auctionId: string, userId: string, razorpayPayId: string): Promise<{
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
    getEmdStatus(auctionId: string, userId: string): Promise<{
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
    completeAuction(auctionId: string): Promise<{
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
