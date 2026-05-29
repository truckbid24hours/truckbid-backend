import { Module, forwardRef } from '@nestjs/common';
import { AuctionGateway } from './auction.gateway';
import { AuctionsModule } from '../auctions/auctions.module';

@Module({
  imports: [forwardRef(() => AuctionsModule)],
  providers: [AuctionGateway],
  exports: [AuctionGateway],
})
export class AuctionGatewayModule {}
