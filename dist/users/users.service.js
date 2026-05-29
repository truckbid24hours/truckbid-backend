"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMe(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const { passwordHash, aadhaarEnc, panEnc, ...safe } = user;
        return safe;
    }
    async updateMe(userId, data) {
        return this.prisma.user.update({ where: { id: userId }, data, select: { id: true, fullName: true, email: true, phone: true, role: true, kycStatus: true } });
    }
    async submitKyc(userId, data) {
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
    async getKycStatus(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { kycStatus: true, kycDocuments: true } });
        return user;
    }
    async getAllUsers(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' }, select: { id: true, fullName: true, email: true, phone: true, role: true, kycStatus: true, isSuspended: true, createdAt: true } }),
            this.prisma.user.count(),
        ]);
        return { users, total, page, pages: Math.ceil(total / limit) };
    }
    async suspendUser(userId, suspend) {
        return this.prisma.user.update({ where: { id: userId }, data: { isSuspended: suspend }, select: { id: true, isSuspended: true } });
    }
    async approveKyc(userId, approved) {
        return this.prisma.user.update({ where: { id: userId }, data: { kycStatus: approved ? 'VERIFIED' : 'REJECTED' }, select: { id: true, kycStatus: true } });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map