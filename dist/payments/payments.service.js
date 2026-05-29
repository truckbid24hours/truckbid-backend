"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const Razorpay = require('razorpay');
let PaymentsService = class PaymentsService {
    constructor(prisma) {
        this.prisma = prisma;
        console.log('Razorpay Key ID:', process.env.RAZORPAY_KEY_ID);
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_xxx',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'xxx',
        });
    }
    async createListingFeeOrder(listingId) {
        const simulatedOrderId = `order_sim_${Date.now()}`;
        await this.prisma.listing.update({
            where: { id: listingId },
            data: {
                listingFeePaid: true,
                listingFeeTxnId: simulatedOrderId,
                status: 'PENDING_APPROVAL',
            },
        });
        return {
            orderId: simulatedOrderId,
            amount: 250,
            currency: 'INR',
            listingId,
            simulated: true,
        };
    }
    async createEmdOrder(auctionId, userId) {
        const auction = await this.prisma.auction.findUnique({
            where: { id: auctionId },
            include: { listing: true },
        });
        if (!auction)
            throw new common_1.BadRequestException('Auction not found');
        const emdAmount = Math.round(auction.listing.basePrice * 0.03);
        const order = await this.razorpay.orders.create({
            amount: emdAmount * 100,
            currency: 'INR',
            receipt: `emd_${auctionId.replace(/-/g, '').substring(0, 36)}`,
            notes: { auctionId, userId, type: 'emd' },
        });
        return { orderId: order.id, amount: emdAmount, currency: 'INR', auctionId };
    }
    async createFinalPaymentOrder(transactionId, buyerId) {
        const txn = await this.prisma.transaction.findUnique({ where: { id: transactionId } });
        if (!txn)
            throw new common_1.BadRequestException('Transaction not found');
        if (txn.buyerId !== buyerId)
            throw new common_1.BadRequestException('Not authorized');
        const emd = await this.prisma.emd.findFirst({
            where: { auctionId: txn.auctionId, userId: buyerId },
        });
        const emdHeld = emd ? emd.amount : 0;
        const totalDue = txn.finalPrice + txn.buyerFee - emdHeld;
        const order = await this.razorpay.orders.create({
            amount: Math.round(totalDue * 100),
            currency: 'INR',
            receipt: `fin_${transactionId.replace(/-/g, '').substring(0, 36)}`,
            notes: { transactionId, buyerId, type: 'final_payment' },
        });
        await this.prisma.transaction.update({
            where: { id: transactionId },
            data: { razorpayOrderId: order.id },
        });
        return {
            orderId: order.id,
            amount: totalDue,
            currency: 'INR',
            breakdown: {
                finalPrice: txn.finalPrice,
                buyerFee: txn.buyerFee,
                emdAdjusted: emdHeld,
                totalDue,
            },
        };
    }
    async handleWebhook(payload, signature) {
        const event = payload.event;
        const data = payload.payload?.payment?.entity;
        if (event === 'payment.captured') {
            const notes = data?.notes;
            if (notes?.type === 'listing_fee') {
                await this.prisma.listing.update({
                    where: { id: notes.listingId },
                    data: {
                        listingFeePaid: true,
                        listingFeeTxnId: data.id,
                        status: 'PENDING_APPROVAL',
                    },
                });
            }
            if (notes?.type === 'final_payment') {
                const txn = await this.prisma.transaction.findUnique({
                    where: { id: notes.transactionId },
                });
                await this.prisma.transaction.update({
                    where: { id: notes.transactionId },
                    data: { paymentStatus: 'COMPLETED' },
                });
                await this.prisma.emd.updateMany({
                    where: { auctionId: txn.auctionId, userId: notes.buyerId },
                    data: { status: 'REFUNDED', refundedAt: new Date() },
                });
            }
        }
        return { received: true };
    }
    async getMyTransactions(userId) {
        return this.prisma.transaction.findMany({
            where: { buyerId: userId },
            include: {
                auction: {
                    include: { listing: { select: { title: true } } },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map