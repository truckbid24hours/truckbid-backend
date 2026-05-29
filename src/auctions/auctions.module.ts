import { Module, forwardRef } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { AuctionsController } from './auctions.controller';
import { AuctionGatewayModule } from '../gateway/auction.module';

@Module({
  imports: [forwardRef(() => AuctionGatewayModule)],
  providers: [AuctionsService],
  controllers: [AuctionsController],
  exports: [AuctionsService],
})
export class AuctionsModule {}
