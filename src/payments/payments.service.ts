import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const Razorpay = require('razorpay');

@Injectable()
export class PaymentsService {
  private razorpay: any;

  constructor(private prisma: PrismaService) {
    console.log('Razorpay Key ID:', process.env.RAZORPAY_KEY_ID);
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_xxx',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'xxx',
    });
  }

  async createListingFeeOrder(listingId: string) {
    // Simulate order for testing - replace with real Razorpay in production
    const simulatedOrderId = `order_sim_${Date.now()}`;

    // Mark listing fee as paid directly
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

  async createEmdOrder(auctionId: string, userId: string) {
    const auction = await this.prisma.auction.findUnique({
      where: { id: auctionId },
      include: { listing: true },
    });
    if (!auction) throw new BadRequestException('Auction not found');

    const emdAmount = Math.round(auction.listing.basePrice * 0.03);
    const order = await this.razorpay.orders.create({
      amount: emdAmount * 100,
      currency: 'INR',
      receipt: `emd_${auctionId.replace(/-/g, '').substring(0, 36)}`,
      notes: { auctionId, userId, type: 'emd' },
    });
    return { orderId: order.id, amount: emdAmount, currency: 'INR', auctionId };
  }

  async createFinalPaymentOrder(transactionId: string, buyerId: string) {
    const txn = await this.prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!txn) throw new BadRequestException('Transaction not found');
    if (txn.buyerId !== buyerId) throw new BadRequestException('Not authorized');

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

  async handleWebhook(payload: any, signature: string) {
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

  async getMyTransactions(userId: string) {
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
}