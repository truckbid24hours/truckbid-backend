import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private paymentsService;
    constructor(paymentsService: PaymentsService);
    createListingFee(id: string): Promise<{
        orderId: string;
        amount: number;
        currency: string;
        listingId: string;
        simulated: boolean;
    }>;
    createEmd(id: string, user: any): Promise<{
        orderId: any;
        amount: number;
        currency: string;
        auctionId: string;
    }>;
    createFinal(id: string, user: any): Promise<{
        orderId: any;
        amount: number;
        currency: string;
        breakdown: {
            finalPrice: number;
            buyerFee: number;
            emdAdjusted: number;
            totalDue: number;
        };
    }>;
    webhook(body: any, sig: string): Promise<{
        received: boolean;
    }>;
    myTransactions(user: any): Promise<({
        auction: {
            listing: {
                title: string;
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
        createdAt: Date;
        finalPrice: number;
        paymentDeadline: Date;
        auctionId: string;
        buyerFee: number;
        sellerFee: number;
        platformRevenue: number;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        razorpayOrderId: string | null;
        buyerId: string;
    })[]>;
}
