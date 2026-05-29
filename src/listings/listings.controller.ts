import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { JwtGuard } from '../common/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('listings')
export class ListingsController {
  constructor(private listingsService: ListingsService) {}

  @Get()
  getAll(@Query() filters: any) {
    return this.listingsService.getAll(filters);
  }

  @Get('pending-admin')
  @UseGuards(JwtGuard)
  getPending() {
    return this.listingsService.getPendingListings();
  }

  @Get('my')
  @UseGuards(JwtGuard)
  getMy(@CurrentUser() user: any) {
    return this.listingsService.getMyListings(user.id);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.listingsService.getOne(id);
  }

  @Post()
  @UseGuards(JwtGuard)
  create(@CurrentUser() user: any, @Body() body: any) {
    return this.listingsService.create(user.id, body);
  }

  @Put('test-approve/:id')
  testApprove(@Param('id') id: string) {
    return this.listingsService.approveListing(id, true);
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() body: any) {
    return this.listingsService.update(id, user.id, body);
  }

  @Post(':id/photos')
  @UseGuards(JwtGuard)
  addPhotos(@Param('id') id: string, @CurrentUser() user: any, @Body() body: { urls: string[] }) {
    return this.listingsService.addPhotos(id, user.id, body.urls);
  }

  @Put(':id/approve')
  @UseGuards(JwtGuard)
  approve(@Param('id') id: string, @Body() body: { approved: boolean }) {
    return this.listingsService.approveListing(id, body.approved);
  }

  @Put(':id/fee-paid')
  @UseGuards(JwtGuard)
  feePaid(@Param('id') id: string, @Body() body: { txnId: string }) {
    return this.listingsService.markListingFeePaid(id, body.txnId);
  }
}
