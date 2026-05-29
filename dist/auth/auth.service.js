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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcryptjs");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.otpStore = new Map();
    }
    async register(dto) {
        const existing = await this.prisma.user.findFirst({
            where: { OR: [{ email: dto.email }, { phone: dto.phone }] },
        });
        if (existing)
            throw new common_1.ConflictException('Email or phone already registered');
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                fullName: dto.fullName,
                phone: dto.phone,
                email: dto.email,
                passwordHash,
                role: dto.role,
            },
        });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        this.otpStore.set(dto.phone, { otp, expires: Date.now() + 10 * 60 * 1000 });
        console.log(`📱 OTP for ${dto.phone}: ${otp}`);
        return { message: 'Registered successfully. OTP sent to phone.', userId: user.id, otp };
    }
    async verifyOtp(phone, otp) {
        const record = this.otpStore.get(phone);
        if (!record)
            throw new common_1.BadRequestException('OTP not found. Request a new one.');
        if (Date.now() > record.expires)
            throw new common_1.BadRequestException('OTP expired');
        if (record.otp !== otp)
            throw new common_1.BadRequestException('Invalid OTP');
        this.otpStore.delete(phone);
        const user = await this.prisma.user.findUnique({ where: { phone } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
        return { message: 'Phone verified', token, user: this.sanitize(user) };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (user.isSuspended)
            throw new common_1.UnauthorizedException('Account suspended. Contact support.');
        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
        return { token, user: this.sanitize(user) };
    }
    sanitize(user) {
        const { passwordHash, aadhaarEnc, panEnc, ...safe } = user;
        return safe;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map