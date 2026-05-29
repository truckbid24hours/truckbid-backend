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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const auction_state_1 = require("../common/auction-state");
const auction_gateway_1 = require("../gateway/auction.gateway");
let AuctionsService = class AuctionsService {
    constructor(prisma, auctionGateway) {
        this.prisma = prisma;
        this.auctionGateway = auctionGateway;
    }
    async schedule(listingId, scheduledStart) {
        const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
        if (!listing)
            throw new common_1.NotFoundException('Listing not found');
        if (listing.status !== 'APPROVED')
            throw new common_1.BadRequestException('Listing must be approved first');
        const start = new Date(scheduledStart);
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        const auction = await this.prisma.auction.create({
            data: { listingId, scheduledStart: start, scheduledEnd: end },
        });
        await this.prisma.listing.update({ where: { id: listingId }, data: { status: 'AUCTION_SCHEDULED' } });
        return auction;
    }
    async getAll() {
        return this.prisma.auction.findMany({
            include: { listing: { select: { title: true, make: true, model: true, location: true, basePrice: true, photos: true } } },
            orderBy: { scheduledStart: 'asc' },
        });
    }
    async getLive() {
        return this.prisma.auction.findMany({
            where: { status: 'LIVE' },
            include: { listing: true },
        });
    }
    async getOne(id) {
        const auction = await this.prisma.auction.findUnique({
            where: { id },
            include: { listing: { include: { seller: { select: { fullName: true, id: true } } } }, bids: { orderBy: { amount: 'desc' }, take: 20 } },
        });
        if (!auction)
            throw new common_1.NotFoundException();
        const highestBid = auction_state_1.auctionState.get(`auction:${id}:highest_bid`) ?? null;
        const timeRemaining = auction_state_1.auctionState.get(`auction:${id}:time_remaining`) ?? null;
        const bidCount = auction_state_1.auctionState.get(`auction:${id}:bid_count`) ?? null;
        return {
            ...auction,
            liveState: {
                highestBid: highestBid ? parseFloat(highestBid) : auction.listing.basePrice,
                timeRemaining: timeRemaining ? parseInt(timeRemaining) : 0,
                bidCount: bidCount ? parseInt(bidCount) : 0,
            },
        };
    }
    async goLive(auctionId) {
        const auction = await this.prisma.auction.findUnique({ where: { id: auctionId }, include: { listing: true } });
        if (!auction)
            throw new common_1.NotFoundException();
        if (auction.status !== 'SCHEDULED')
            throw new common_1.BadRequestException('Auction not in scheduled state');
        await this.prisma.auction.update({ where: { id: auctionId }, data: { status: 'LIVE', actualStart: new Date() } });
        await this.prisma.listing.update({ where: { id: auction.listingId }, data: { status: 'AUCTION_LIVE' } });
        auction_state_1.auctionState.set(`auction:${auctionId}:highest_bid`, String(auction.listing.basePrice));
        auction_state_1.auctionState.set(`auction:${auctionId}:highest_bidder`, '');
        auction_state_1.auctionState.set(`auction:${auctionId}:time_remaining`, '30');
        auction_state_1.auctionState.set(`auction:${auctionId}:bid_count`, '0');
        auction_state_1.auctionState.set(`auction:${auctionId}:extension_count`, '0');
        this.auctionGateway.startAuctionCountdown(auctionId);
        return { message: 'Auction is now LIVE', auctionId };
    }
    async payEmd(auctionId, userId, razorpayPayId) {
        const auction = await this.prisma.auction.findUnique({ where: { id: auctionId }, include: { listing: true } });
        if (!auction)
            throw new common_1.NotFoundException();
        const existing = await this.prisma.emd.findFirst({ where: { auctionId, userId } });
        if (existing)
            throw new common_1.BadRequestException('EMD already paid for this auction');
        const emdAmount = auction.listing.basePrice * 0.03;
        const payId = razorpayPayId || `sim_emd_${Date.now()}`;
        return this.prisma.emd.create({
            data: { auctionId, userId, amount: emdAmount, razorpayPayId: payId, status: 'HELD' },
        });
    }
    async getEmdStatus(auctionId, userId) {
        return this.prisma.emd.findFirst({ where: { auctionId, userId } });
    }
    async completeAuction(auctionId) {
        const existing = await this.prisma.auction.findUnique({ where: { id: auctionId }, include: { listing: true } });
        if (!existing)
            throw new common_1.NotFoundException();
        if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
            return {
                result: existing.status === 'COMPLETED' ? 'sold' : 'unsold',
                winnerId: existing.winningBidderId,
                finalPrice: existing.finalPrice ?? 0,
            };
        }
        const highestBid = auction_state_1.auctionState.get(`auction:${auctionId}:highest_bid`) ?? null;
        const winnerId = auction_state_1.auctionState.get(`auction:${auctionId}:highest_bidder`) || null;
        const finalPrice = parseFloat(highestBid || '0');
        if (!winnerId || finalPrice <= existing.listing.basePrice) {
            await this.prisma.auction.update({
                where: { id: auctionId },
                data: { status: 'CANCELLED', actualEnd: new Date() },
            });
            await this.prisma.listing.update({ where: { id: existing.listingId }, data: { status: 'UNSOLD' } });
            await this.prisma.emd.updateMany({ where: { auctionId }, data: { status: 'REFUNDED', refundedAt: new Date() } });
            return { result: 'unsold', winnerId: null, finalPrice: 0 };
        }
        const buyerFee = finalPrice * 0.02;
        const sellerFee = finalPrice * 0.02;
        await this.prisma.auction.update({
            where: { id: auctionId },
            data: { status: 'COMPLETED', actualEnd: new Date(), winningBidderId: winnerId, finalPrice },
        });
        await this.prisma.listing.update({ where: { id: existing.listingId }, data: { status: 'SOLD' } });
        const paymentDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.prisma.transaction.create({
            data: { auctionId, buyerId: winnerId, finalPrice, buyerFee, sellerFee, platformRevenue: buyerFee + sellerFee, paymentDeadline },
        });
        await this.prisma.emd.updateMany({
            where: { auctionId, userId: { not: winnerId } },
            data: { status: 'REFUNDED', refundedAt: new Date() },
        });
        return { result: 'sold', winnerId, finalPrice, paymentDeadline };
    }
};
exports.AuctionsService = AuctionsService;
exports.AuctionsService = AuctionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => auction_gateway_1.AuctionGateway))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auction_gateway_1.AuctionGateway])
], AuctionsService);
//# sourceMappingURL=auctions.service.js.map