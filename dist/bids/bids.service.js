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
exports.BidsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BidsService = class BidsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMyBids(userId) {
        return this.prisma.bid.findMany({
            where: { bidderId: userId },
            include: { auction: { include: { listing: { select: { title: true, make: true, model: true } } } } },
            orderBy: { timestamp: 'desc' },
        });
    }
    async getAuctionBids(auctionId) {
        return this.prisma.bid.findMany({
            where: { auctionId },
            orderBy: { amount: 'desc' },
            include: { bidder: { select: { fullName: true } } },
        });
    }
    async saveBid(auctionId, bidderId, amount) {
        await this.prisma.bid.updateMany({ where: { auctionId, isWinning: true }, data: { isWinning: false } });
        return this.prisma.bid.create({ data: { auctionId, bidderId, amount, isWinning: true } });
    }
};
exports.BidsService = BidsService;
exports.BidsService = BidsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BidsService);
//# sourceMappingURL=bids.service.js.map