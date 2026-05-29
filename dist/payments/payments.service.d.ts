import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentsService {
    private prisma;
    private razorpay;
    constructor(prisma: PrismaService);
    createListingFeeOrder(listingId: string): Promise<{
        orderId: string;
        amount: number;
        currency: string;
        listingId: string;
        simulated: boolean;
    }>;
    createEmdOrder(auctionId: string, userId: string): Promise<{
        orderId: any;
        amount: number;
        currency: string;
        auctionId: string;
    }>;
    createFinalPaymentOrder(transactionId: string, buyerId: string): Promise<{
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
    handleWebhook(payload: any, signature: string): Promise<{
        received: boolean;
    }>;
    getMyTransactions(userId: string): Promise<({
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
