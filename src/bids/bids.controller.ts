import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BidsService } from './bids.service';
import { JwtGuard } from '../common/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtGuard)
@Controller('bids')
export class BidsController {
  constructor(private bidsService: BidsService) {}

  @Get('me')
  getMyBids(@CurrentUser() user: any) { return this.bidsService.getMyBids(user.id); }

  @Get('auction/:id')
  getAuctionBids(@Param('id') id: string) { return this.bidsService.getAuctionBids(id); }
}
