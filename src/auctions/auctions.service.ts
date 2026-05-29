import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { auctionState } from '../common/auction-state';
import { AuctionGateway } from '../gateway/auction.gateway';

@Injectable()
export class AuctionsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => AuctionGateway))
    private auctionGateway: AuctionGateway,
  ) {}

  async schedule(listingId: string, scheduledStart: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.status !== 'APPROVED') throw new BadRequestException('Listing must be approved first');

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

  async getOne(id: string) {
    const auction = await this.prisma.auction.findUnique({
      where: { id },
      include: { listing: { include: { seller: { select: { fullName: true, id: true } } } }, bids: { orderBy: { amount: 'desc' }, take: 20 } },
    });
    if (!auction) throw new NotFoundException();

    const highestBid = auctionState.get(`auction:${id}:highest_bid`) ?? null;
    const timeRemaining = auctionState.get(`auction:${id}:time_remaining`) ?? null;
    const bidCount = auctionState.get(`auction:${id}:bid_count`) ?? null;

    return {
      ...auction,
      liveState: {
        highestBid: highestBid ? parseFloat(highestBid) : auction.listing.basePrice,
        timeRemaining: timeRemaining ? parseInt(timeRemaining) : 0,
        bidCount: bidCount ? parseInt(bidCount) : 0,
      },
    };
  }

  async goLive(auctionId: string) {
    const auction = await this.prisma.auction.findUnique({ where: { id: auctionId }, include: { listing: true } });
    if (!auction) throw new NotFoundException();
    if (auction.status !== 'SCHEDULED') throw new BadRequestException('Auction not in scheduled state');

    await this.prisma.auction.update({ where: { id: auctionId }, data: { status: 'LIVE', actualStart: new Date() } });
    await this.prisma.listing.update({ where: { id: auction.listingId }, data: { status: 'AUCTION_LIVE' } });

    auctionState.set(`auction:${auctionId}:highest_bid`, String(auction.listing.basePrice));
    auctionState.set(`auction:${auctionId}:highest_bidder`, '');
    auctionState.set(`auction:${auctionId}:time_remaining`, '30'); // TEST: 30s — change back to '3600' for production
    auctionState.set(`auction:${auctionId}:bid_count`, '0');
    auctionState.set(`auction:${auctionId}:extension_count`, '0');

    // Start server-side countdown — one source of truth for all clients
    this.auctionGateway.startAuctionCountdown(auctionId);

    return { message: 'Auction is now LIVE', auctionId };
  }

  async payEmd(auctionId: string, userId: string, razorpayPayId: string) {
    const auction = await this.prisma.auction.findUnique({ where: { id: auctionId }, include: { listing: true } });
    if (!auction) throw new NotFoundException();

    const existing = await this.prisma.emd.findFirst({ where: { auctionId, userId } });
    if (existing) throw new BadRequestException('EMD already paid for this auction');

    const emdAmount = auction.listing.basePrice * 0.03;
    const payId = razorpayPayId || `sim_emd_${Date.now()}`;
    return this.prisma.emd.create({
      data: { auctionId, userId, amount: emdAmount, razorpayPayId: payId, status: 'HELD' },
    });
  }

  async getEmdStatus(auctionId: string, userId: string) {
    return this.prisma.emd.findFirst({ where: { auctionId, userId } });
  }

  async completeAuction(auctionId: string) {
    // Guard against double-finalization
    const existing = await this.prisma.auction.findUnique({ where: { id: auctionId }, include: { listing: true } });
    if (!existing) throw new NotFoundException();
    if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
      return {
        result: existing.status === 'COMPLETED' ? 'sold' : 'unsold',
        winnerId: existing.winningBidderId,
        finalPrice: existing.finalPrice ?? 0,
      };
    }

    const highestBid = auctionState.get(`auction:${auctionId}:highest_bid`) ?? null;
    const winnerId = auctionState.get(`auction:${auctionId}:highest_bidder`) || null;
    const finalPrice = parseFloat(highestBid || '0');

    // No valid bids — winner is empty string or price didn't exceed base
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

    // Refund all losing bidders' EMD; winner's EMD stays HELD
    await this.prisma.emd.updateMany({
      where: { auctionId, userId: { not: winnerId } },
      data: { status: 'REFUNDED', refundedAt: new Date() },
    });

    return { result: 'sold', winnerId, finalPrice, paymentDeadline };
  }
}
