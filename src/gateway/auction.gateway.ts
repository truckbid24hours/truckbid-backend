import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Inject, forwardRef } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { auctionState } from '../common/auction-state';
import { AuctionsService } from '../auctions/auctions.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/auction',
})
export class AuctionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private intervals = new Map<string, NodeJS.Timeout>();
  private finalizedAuctions = new Set<string>();

  constructor(
    @Inject(forwardRef(() => AuctionsService))
    private auctionsService: AuctionsService,
    private prisma: PrismaService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`🔌 Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`🔌 Client disconnected: ${client.id}`);
  }

  // Called by AuctionsService.goLive — starts the server-side countdown
  startAuctionCountdown(auctionId: string) {
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

  // Decrement timer and broadcast tick to all clients in the room
  async tickCountdown(auctionId: string): Promise<number> {
    const current = parseInt(auctionState.get(`auction:${auctionId}:time_remaining`) || '0');
    if (current <= 0) return 0;

    const newTime = current - 1;
    auctionState.set(`auction:${auctionId}:time_remaining`, String(newTime));
    this.server.to(auctionId).emit('tick', { timeRemaining: newTime });
    return newTime;
  }

  // Run completeAuction on the service and broadcast result — guarded against double-fire
  async finalizeAuction(auctionId: string) {
    if (this.finalizedAuctions.has(auctionId)) return;
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
      } else {
        this.server.to(auctionId).emit('auction_ended', {
          winnerId: result.winnerId,
          finalPrice: result.finalPrice,
          message: '🏆 Auction ended! Winner declared.',
        });
        console.log(`🏁 Auction ${auctionId} sold. Winner: ${result.winnerId}, Price: ${result.finalPrice}`);
      }
    } catch (err) {
      console.error(`Error finalizing auction ${auctionId}:`, err);
    }
  }

  @SubscribeMessage('join_auction')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { auctionId: string; userId: string },
  ) {
    const { auctionId, userId } = data;
    client.join(auctionId);

    const emd = await this.prisma.emd.findFirst({ where: { auctionId, userId, status: 'HELD' } });

    const highestBid = auctionState.get(`auction:${auctionId}:highest_bid`) ?? null;
    const timeRemaining = auctionState.get(`auction:${auctionId}:time_remaining`) ?? null;
    const bidCount = auctionState.get(`auction:${auctionId}:bid_count`) ?? null;

    client.emit('auction_state', {
      highestBid: parseFloat(highestBid || '0'),
      timeRemaining: parseInt(timeRemaining || '0'),
      bidCount: parseInt(bidCount || '0'),
      canBid: !!emd,
    });

    console.log(`👤 User ${userId} joined auction ${auctionId}`);
  }

  @SubscribeMessage('place_bid')
  async handleBid(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { auctionId: string; userId: string; amount: number },
  ) {
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

      const timeRemaining = parseInt(auctionState.get(`auction:${auctionId}:time_remaining`) || '0');
      if (timeRemaining <= 0) {
        client.emit('bid_error', { message: 'Auction has ended' });
        return;
      }

      const currentHighest = parseFloat(auctionState.get(`auction:${auctionId}:highest_bid`) || '0');
      if (amount <= currentHighest) {
        client.emit('bid_error', { message: `Bid must be above ₹${currentHighest.toLocaleString('en-IN')}` });
        return;
      }

      if (amount < auction.listing.basePrice) {
        client.emit('bid_error', { message: 'Bid cannot be below base price' });
        return;
      }

      const prevHighestBidder = auctionState.get(`auction:${auctionId}:highest_bidder`) ?? null;

      auctionState.set(`auction:${auctionId}:highest_bid`, String(amount));
      auctionState.set(`auction:${auctionId}:highest_bidder`, userId);
      const currentBidCount = parseInt(auctionState.get(`auction:${auctionId}:bid_count`) || '0');
      auctionState.set(`auction:${auctionId}:bid_count`, String(currentBidCount + 1));

      await this.prisma.bid.updateMany({ where: { auctionId, isWinning: true }, data: { isWinning: false } });
      await this.prisma.bid.create({ data: { auctionId, bidderId: userId, amount, isWinning: true } });

      const newBidCount = parseInt(auctionState.get(`auction:${auctionId}:bid_count`) || '0');

      // Anti-snipe: extend only in final 5 min, max 5 times total
      const extensionCount = parseInt(auctionState.get(`auction:${auctionId}:extension_count`) || '0');
      if (timeRemaining <= 300 && extensionCount < 5) {
        const newTime = timeRemaining + 300;
        const newExtCount = extensionCount + 1;
        auctionState.set(`auction:${auctionId}:time_remaining`, String(newTime));
        auctionState.set(`auction:${auctionId}:extension_count`, String(newExtCount));
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

    } catch (err) {
      console.error('Bid error:', err);
      client.emit('bid_error', { message: 'Something went wrong. Please try again.' });
    }
  }
}
