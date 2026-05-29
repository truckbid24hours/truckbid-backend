import { Controller, Post, Get, Body, Param, UseGuards, Headers } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtGuard } from '../common/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('listing-fee/:listingId')
  @UseGuards(JwtGuard)
  createListingFee(@Param('listingId') id: string) {
    return this.paymentsService.createListingFeeOrder(id);
  }

  @Post('emd/:auctionId')
  @UseGuards(JwtGuard)
  createEmd(@Param('auctionId') id: string, @CurrentUser() user: any) {
    return this.paymentsService.createEmdOrder(id, user.id);
  }

  @Post('final/:transactionId')
  @UseGuards(JwtGuard)
  createFinal(@Param('transactionId') id: string, @CurrentUser() user: any) {
    return this.paymentsService.createFinalPaymentOrder(id, user.id);
  }

  @Post('webhook')
  webhook(@Body() body: any, @Headers('x-razorpay-signature') sig: string) {
    return this.paymentsService.handleWebhook(body, sig);
  }

  @Get('transactions/me')
  @UseGuards(JwtGuard)
  myTransactions(@CurrentUser() user: any) {
    return this.paymentsService.getMyTransactions(user.id);
  }
}
