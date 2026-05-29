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
exports.AuctionGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const prisma_service_1 = require("../prisma/prisma.service");
const auction_state_1 = require("../common/auction-state");
const auctions_service_1 = require("../auctions/auctions.service");
let AuctionGateway = class AuctionGateway {
    constructor(auctionsService, prisma) {
        this.auctionsService = auctionsService;
        this.prisma = prisma;
        this.intervals = new Map();
        this.finalizedAuctions = new Set();
    }
    handleConnection(client) {
        console.log(`🔌 Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`🔌 Client disconnected: ${client.id}`);
    }
    startAuctionCountdown(auctionId) {
        if (this.intervals.has(auctionId)) {
            clearInterval(this.intervals.get(auctionId));
            this.intervals.delete(auctionId);
        }
        this.finalizedAuctions.delete(auctionId);
        const interval = setInterval(async () => {
            const remaining = await this.tickCountdown(auctionId);
            if (remaining <= 0) {
                clearInterval(this.intervals.get(auctionId));
                this.intervals.delete(auctionId);
                await this.finalizeAuction(auctionId);
            }
        }, 1000);
        this.intervals.set(auctionId, interval);
        console.log(`⏱️  Countdown started for auction ${auctionId}`);
    }
    async tickCountdown(auctionId) {
        const current = parseInt(auction_state_1.auctionState.get(`auction:${auctionId}:time_remaining`) || '0');
        if (current <= 0)
            return 0;
        const newTime = current - 1;
        auction_state_1.auctionState.set(`auction:${auctionId}:time_remaining`, String(newTime));
        this.server.to(auctionId).emit('tick', { timeRemaining: newTime });
        return newTime;
    }
    async finalizeAuction(auctionId) {
        if (this.finalizedAuctions.has(auctionId))
            return;
        this.finalizedAuctions.add(auctionId);
        try {
            const result = await this.auctionsService.completeAuction(auctionId);
            if (result.result === 'unsold') {
                this.server.to(auctionId).emit('auction_ended', {
                    winnerId: null,
                    finalPrice: 0,
                    message: 'No bids — auction unsold',
                });
                console.log(`🏁 Auction ${auctionId} ended with no bids.`);
            }
            else {
                this.server.to(auctionId).emit('auction_ended', {
                    winnerId: result.winnerId,
                    finalPrice: result.finalPrice,
                    message: '🏆 Auction ended! Winner declared.',
                });
                console.log(`🏁 Auction ${auctionId} sold. Winner: ${result.winnerId}, Price: ${result.finalPrice}`);
            }
        }
        catch (err) {
            console.error(`Error finalizing auction ${auctionId}:`, err);
        }
    }
    async handleJoin(client, data) {
        const { auctionId, userId } = data;
        client.join(auctionId);
        const emd = await this.prisma.emd.findFirst({ where: { auctionId, userId, status: 'HELD' } });
        const highestBid = auction_state_1.auctionState.get(`auction:${auctionId}:highest_bid`) ?? null;
        const timeRemaining = auction_state_1.auctionState.get(`auction:${auctionId}:time_remaining`) ?? null;
        const bidCount = auction_state_1.auctionState.get(`auction:${auctionId}:bid_count`) ?? null;
        client.emit('auction_state', {
            highestBid: parseFloat(highestBid || '0'),
            timeRemaining: parseInt(timeRemaining || '0'),
            bidCount: parseInt(bidCount || '0'),
            canBid: !!emd,
        });
        console.log(`👤 User ${userId} joined auction ${auctionId}`);
    }
    async handleBid(client, data) {
        const { auctionId, userId, amount } = data;
        try {
            const emd = await this.prisma.emd.findFirst({ where: { auctionId, userId, status: 'HELD' } });
            if (!emd) {
                client.emit('bid_error', { message: 'Pay EMD first to participate' });
                return;
            }
            const auction = await this.prisma.auction.findUnique({ where: { id: auctionId }, include: { listing: true } });
            if (!auction || auction.status !== 'LIVE') {
                client.emit('bid_error', { message: 'Auction is not live' });
                return;
            }
            if (auction.listing.sellerId === userId) {
                client.emit('bid_error', { message: 'Sellers cannot bid on their own listing' });
                return;
            }
            const timeRemaining = parseInt(auction_state_1.auctionState.get(`auction:${auctionId}:time_remaining`) || '0');
            if (timeRemaining <= 0) {
                client.emit('bid_error', { message: 'Auction has ended' });
                return;
            }
            const currentHighest = parseFloat(auction_state_1.auctionState.get(`auction:${auctionId}:highest_bid`) || '0');
            if (amount <= currentHighest) {
                client.emit('bid_error', { message: `Bid must be above ₹${currentHighest.toLocaleString('en-IN')}` });
                return;
            }
            if (amount < auction.listing.basePrice) {
                client.emit('bid_error', { message: 'Bid cannot be below base price' });
                return;
            }
            const prevHighestBidder = auction_state_1.auctionState.get(`auction:${auctionId}:highest_bidder`) ?? null;
            auction_state_1.auctionState.set(`auction:${auctionId}:highest_bid`, String(amount));
            auction_state_1.auctionState.set(`auction:${auctionId}:highest_bidder`, userId);
            const currentBidCount = parseInt(auction_state_1.auctionState.get(`auction:${auctionId}:bid_count`) || '0');
            auction_state_1.auctionState.set(`auction:${auctionId}:bid_count`, String(currentBidCount + 1));
            await this.prisma.bid.updateMany({ where: { auctionId, isWinning: true }, data: { isWinning: false } });
            await this.prisma.bid.create({ data: { auctionId, bidderId: userId, amount, isWinning: true } });
            const newBidCount = parseInt(auction_state_1.auctionState.get(`auction:${auctionId}:bid_count`) || '0');
            const extensionCount = parseInt(auction_state_1.auctionState.get(`auction:${auctionId}:extension_count`) || '0');
            if (timeRemaining <= 300 && extensionCount < 5) {
                const newTime = timeRemaining + 300;
                const newExtCount = extensionCount + 1;
                auction_state_1.auctionState.set(`auction:${auctionId}:time_remaining`, String(newTime));
                auction_state_1.auctionState.set(`auction:${auctionId}:extension_count`, String(newExtCount));
                this.server.to(auctionId).emit('auction_extended', {
                    newTimeRemaining: newTime,
                    extensionCount: newExtCount,
                    message: `⏰ Auction extended! ${5 - newExtCount} extension${5 - newExtCount === 1 ? '' : 's'} remaining`,
                });
            }
            this.server.to(auctionId).emit('bid_update', {
                newHighestBid: amount,
                bidCount: newBidCount,
                timeRemaining,
                bidderId: userId.substring(0, 8),
            });
            if (prevHighestBidder && prevHighestBidder !== userId && prevHighestBidder !== '') {
                this.server.to(prevHighestBidder).emit('outbid_alert', {
                    auctionId,
                    newHighestBid: amount,
                    message: `You've been outbid! New highest: ₹${amount.toLocaleString('en-IN')}`,
                });
            }
            client.emit('bid_success', { amount, message: 'Bid placed successfully!' });
        }
        catch (err) {
            console.error('Bid error:', err);
            client.emit('bid_error', { message: 'Something went wrong. Please try again.' });
        }
    }
};
exports.AuctionGateway = AuctionGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], AuctionGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_auction'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], AuctionGateway.prototype, "handleJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('place_bid'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], AuctionGateway.prototype, "handleBid", null);
exports.AuctionGateway = AuctionGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        namespace: '/auction',
    }),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => auctions_service_1.AuctionsService))),
    __metadata("design:paramtypes", [auctions_service_1.AuctionsService,
        prisma_service_1.PrismaService])
], AuctionGateway);
//# sourceMappingURL=auction.gateway.js.map