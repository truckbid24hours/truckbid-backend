import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  // In-memory OTP store (use Redis in prod)
  private otpStore = new Map<string, { otp: string; expires: number }>();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { phone: dto.phone }] },
    });
    if (existing) throw new ConflictException('Email or phone already registered');

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

    // Generate OTP (in prod: send via SMS/WhatsApp)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpStore.set(dto.phone, { otp, expires: Date.now() + 10 * 60 * 1000 });
    console.log(`📱 OTP for ${dto.phone}: ${otp}`); // Remove in production

    return { message: 'Registered successfully. OTP sent to phone.', userId: user.id, otp }; // Remove otp from response in prod
  }

  async verifyOtp(phone: string, otp: string) {
    const record = this.otpStore.get(phone);
    if (!record) throw new BadRequestException('OTP not found. Request a new one.');
    if (Date.now() > record.expires) throw new BadRequestException('OTP expired');
    if (record.otp !== otp) throw new BadRequestException('Invalid OTP');

    this.otpStore.delete(phone);
    const user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) throw new BadRequestException('User not found');

    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    return { message: 'Phone verified', token, user: this.sanitize(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.isSuspended) throw new UnauthorizedException('Account suspended. Contact support.');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
    return { token, user: this.sanitize(user) };
  }

  private sanitize(user: any) {
    const { passwordHash, aadhaarEnc, panEnc, ...safe } = user;
    return safe;
  }
}
