import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ListingsModule } from './listings/listings.module';
import { AuctionsModule } from './auctions/auctions.module';
import { BidsModule } from './bids/bids.module';
import { PaymentsModule } from './payments/payments.module';
import { AuctionGatewayModule } from './gateway/auction.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ListingsModule,
    AuctionsModule,
    BidsModule,
    PaymentsModule,
    AuctionGatewayModule,
  ],
})
export class AppModule {}
