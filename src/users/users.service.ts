import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, aadhaarEnc, panEnc, ...safe } = user;
    return safe;
  }

  async updateMe(userId: string, data: { fullName?: string; email?: string }) {
    return this.prisma.user.update({ where: { id: userId }, data, select: { id: true, fullName: true, email: true, phone: true, role: true, kycStatus: true } });
  }

  async submitKyc(userId: string, data: { aadhaar: string; pan: string; documents: string[] }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        aadhaarEnc: Buffer.from(data.aadhaar).toString('base64'),
        panEnc: Buffer.from(data.pan).toString('base64'),
        kycDocuments: data.documents,
        kycStatus: 'PENDING',
      },
      select: { id: true, kycStatus: true },
    });
  }

  async getKycStatus(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { kycStatus: true, kycDocuments: true } });
    return user;
  }

  // Admin
  async getAllUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' }, select: { id: true, fullName: true, email: true, phone: true, role: true, kycStatus: true, isSuspended: true, createdAt: true } }),
      this.prisma.user.count(),
    ]);
    return { users, total, page, pages: Math.ceil(total / limit) };
  }

  async suspendUser(userId: string, suspend: boolean) {
    return this.prisma.user.update({ where: { id: userId }, data: { isSuspended: suspend }, select: { id: true, isSuspended: true } });
  }

  async approveKyc(userId: string, approved: boolean) {
    return this.prisma.user.update({ where: { id: userId }, data: { kycStatus: approved ? 'VERIFIED' : 'REJECTED' }, select: { id: true, kycStatus: true } });
  }
}
