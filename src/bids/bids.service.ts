import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BidsService {
  constructor(private prisma: PrismaService) {}

  async getMyBids(userId: string) {
    return this.prisma.bid.findMany({
      where: { bidderId: userId },
      include: { auction: { include: { listing: { select: { title: true, make: true, model: true } } } } },
      orderBy: { timestamp: 'desc' },
    });
  }

  async getAuctionBids(auctionId: string) {
    return this.prisma.bid.findMany({
      where: { auctionId },
      orderBy: { amount: 'desc' },
      include: { bidder: { select: { fullName: true } } },
    });
  }

  async saveBid(auctionId: string, bidderId: string, amount: number) {
    // Reset previous winning bids
    await this.prisma.bid.updateMany({ where: { auctionId, isWinning: true }, data: { isWinning: false } });
    return this.prisma.bid.create({ data: { auctionId, bidderId, amount, isWinning: true } });
  }
}
