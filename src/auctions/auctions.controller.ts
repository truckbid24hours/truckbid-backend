import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { JwtGuard } from '../common/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auctions')
export class AuctionsController {
  constructor(private auctionsService: AuctionsService) {}

  @Get()
  getAll() { return this.auctionsService.getAll(); }

  @Get('live')
  getLive() { return this.auctionsService.getLive(); }

  @Get(':id')
  getOne(@Param('id') id: string) { return this.auctionsService.getOne(id); }

  @Post()
  @UseGuards(JwtGuard)
  schedule(@Body() body: { listingId: string; scheduledStart: string }) {
    return this.auctionsService.schedule(body.listingId, body.scheduledStart);
  }

  @Post('test-schedule/:listingId')
  testSchedule(@Param('listingId') listingId: string) {
    const start = new Date(Date.now() - 1000).toISOString();
    return this.auctionsService.schedule(listingId, start);
  }

  @Post(':id/go-live')
  @UseGuards(JwtGuard)
  goLive(@Param('id') id: string) { return this.auctionsService.goLive(id); }

  @Post('test-go-live/:id')
  testGoLive(@Param('id') id: string) { return this.auctionsService.goLive(id); }

  @Post(':id/emd')
  @UseGuards(JwtGuard)
  payEmd(@Param('id') id: string, @CurrentUser() user: any, @Body() body: { razorpayPayId: string }) {
    return this.auctionsService.payEmd(id, user.id, body.razorpayPayId);
  }

  @Get(':id/emd/status')
  @UseGuards(JwtGuard)
  emdStatus(@Param('id') id: string, @CurrentUser() user: any) {
    return this.auctionsService.getEmdStatus(id, user.id);
  }

  @Post(':id/complete')
  @UseGuards(JwtGuard)
  complete(@Param('id') id: string) { return this.auctionsService.completeAuction(id); }
}
