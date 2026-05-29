import { Controller, Get, Put, Body, Param, UseGuards, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtGuard } from '../common/guards/jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: any) {
    return this.usersService.getMe(user.id);
  }

  @Put('me')
  updateMe(@CurrentUser() user: any, @Body() body: any) {
    return this.usersService.updateMe(user.id, body);
  }

  @Post('me/kyc')
  submitKyc(@CurrentUser() user: any, @Body() body: any) {
    return this.usersService.submitKyc(user.id, body);
  }

  @Get('me/kyc')
  getKycStatus(@CurrentUser() user: any) {
    return this.usersService.getKycStatus(user.id);
  }

  // Admin routes
  @Get('admin/all')
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Put('admin/:id/suspend')
  suspendUser(@Param('id') id: string, @Body() body: { suspend: boolean }) {
    return this.usersService.suspendUser(id, body.suspend);
  }

  @Put('admin/:id/kyc')
  approveKyc(@Param('id') id: string, @Body() body: { approved: boolean }) {
    return this.usersService.approveKyc(id, body.approved);
  }
}
