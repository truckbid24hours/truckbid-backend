import { BidsService } from './bids.service';
export declare class BidsController {
    private bidsService;
    constructor(bidsService: BidsService);
    getMyBids(user: any): Promise<({
        auction: {
            listing: {
                title: string;
                make: string;
                model: string;
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
        };
    } & {
        id: string;
        auctionId: string;
        amount: number;
        isWinning: boolean;
        timestamp: Date;
        bidderId: string;
    })[]>;
    getAuctionBids(id: string): Promise<({
        bidder: {
            fullName: string;
        };
    } & {
        id: string;
        auctionId: string;
        amount: number;
        isWinning: boolean;
        timestamp: Date;
        bidderId: string;
    })[]>;
}
