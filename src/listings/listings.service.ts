import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ListingsService {
  constructor(private prisma: PrismaService) {}

  async create(sellerId: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id: sellerId } });
    if (user.kycStatus !== 'VERIFIED') throw new ForbiddenException('KYC must be verified before listing');

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

  async getAll(filters: any = {}) {
    const where: any = { status: { in: ['APPROVED', 'AUCTION_SCHEDULED', 'AUCTION_LIVE'] } };
    if (filters.make) where.make = { contains: filters.make, mode: 'insensitive' };
    if (filters.location) where.location = { contains: filters.location, mode: 'insensitive' };
    if (filters.minPrice) where.basePrice = { gte: parseFloat(filters.minPrice) };
    if (filters.maxPrice) where.basePrice = { ...where.basePrice, lte: parseFloat(filters.maxPrice) };

    return this.prisma.listing.findMany({
      where,
      include: { seller: { select: { fullName: true, id: true } }, auction: { select: { status: true, scheduledStart: true, scheduledEnd: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOne(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: { seller: { select: { id: true, fullName: true, createdAt: true } }, auction: true },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    return listing;
  }

  async getMyListings(sellerId: string) {
    return this.prisma.listing.findMany({
      where: { sellerId },
      include: { auction: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, sellerId: string, data: any) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException();
    if (listing.sellerId !== sellerId) throw new ForbiddenException();
    if (!['DRAFT', 'PENDING_APPROVAL'].includes(listing.status)) throw new BadRequestException('Cannot edit after approval');
    return this.prisma.listing.update({ where: { id }, data });
  }

  async addPhotos(id: string, sellerId: string, photoUrls: string[]) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (listing.sellerId !== sellerId) throw new ForbiddenException();
    return this.prisma.listing.update({ where: { id }, data: { photos: { push: photoUrls } } });
  }

  async markListingFeePaid(id: string, txnId: string) {
    return this.prisma.listing.update({
      where: { id },
      data: { listingFeePaid: true, listingFeeTxnId: txnId, status: 'PENDING_APPROVAL' },
    });
  }

  // Admin
  async getPendingListings() {
    return this.prisma.listing.findMany({
      where: { status: 'PENDING_APPROVAL' },
      include: { seller: { select: { fullName: true, phone: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approveListing(id: string, approved: boolean) {
    return this.prisma.listing.update({
      where: { id },
      data: { status: approved ? 'APPROVED' : 'CANCELLED' },
    });
  }
}
