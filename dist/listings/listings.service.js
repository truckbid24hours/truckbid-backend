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
exports.ListingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ListingsService = class ListingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(sellerId, data) {
        const user = await this.prisma.user.findUnique({ where: { id: sellerId } });
        if (user.kycStatus !== 'VERIFIED')
            throw new common_1.ForbiddenException('KYC must be verified before listing');
        return this.prisma.listing.create({
            data: {
                sellerId,
                title: `${data.make} ${data.model} ${data.year}`,
                make: data.make,
                model: data.model,
                year: data.year,
                kmDriven: data.kmDriven,
                location: data.location,
                basePrice: data.basePrice,
                description: data.description || '',
                photos: [],
                status: 'DRAFT',
            },
        });
    }
    async getAll(filters = {}) {
        const where = { status: { in: ['APPROVED', 'AUCTION_SCHEDULED', 'AUCTION_LIVE'] } };
        if (filters.make)
            where.make = { contains: filters.make, mode: 'insensitive' };
        if (filters.location)
            where.location = { contains: filters.location, mode: 'insensitive' };
        if (filters.minPrice)
            where.basePrice = { gte: parseFloat(filters.minPrice) };
        if (filters.maxPrice)
            where.basePrice = { ...where.basePrice, lte: parseFloat(filters.maxPrice) };
        return this.prisma.listing.findMany({
            where,
            include: { seller: { select: { fullName: true, id: true } }, auction: { select: { status: true, scheduledStart: true, scheduledEnd: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getOne(id) {
        const listing = await this.prisma.listing.findUnique({
            where: { id },
            include: { seller: { select: { id: true, fullName: true, createdAt: true } }, auction: true },
        });
        if (!listing)
            throw new common_1.NotFoundException('Listing not found');
        return listing;
    }
    async getMyListings(sellerId) {
        return this.prisma.listing.findMany({
            where: { sellerId },
            include: { auction: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async update(id, sellerId, data) {
        const listing = await this.prisma.listing.findUnique({ where: { id } });
        if (!listing)
            throw new common_1.NotFoundException();
        if (listing.sellerId !== sellerId)
            throw new common_1.ForbiddenException();
        if (!['DRAFT', 'PENDING_APPROVAL'].includes(listing.status))
            throw new common_1.BadRequestException('Cannot edit after approval');
        return this.prisma.listing.update({ where: { id }, data });
    }
    async addPhotos(id, sellerId, photoUrls) {
        const listing = await this.prisma.listing.findUnique({ where: { id } });
        if (listing.sellerId !== sellerId)
            throw new common_1.ForbiddenException();
        return this.prisma.listing.update({ where: { id }, data: { photos: { push: photoUrls } } });
    }
    async markListingFeePaid(id, txnId) {
        return this.prisma.listing.update({
            where: { id },
            data: { listingFeePaid: true, listingFeeTxnId: txnId, status: 'PENDING_APPROVAL' },
        });
    }
    async getPendingListings() {
        return this.prisma.listing.findMany({
            where: { status: 'PENDING_APPROVAL' },
            include: { seller: { select: { fullName: true, phone: true } } },
            orderBy: { createdAt: 'asc' },
        });
    }
    async approveListing(id, approved) {
        return this.prisma.listing.update({
            where: { id },
            data: { status: approved ? 'APPROVED' : 'CANCELLED' },
        });
    }
};
exports.ListingsService = ListingsService;
exports.ListingsService = ListingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ListingsService);
//# sourceMappingURL=listings.service.js.map