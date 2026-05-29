import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private otpStore;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        message: string;
        userId: string;
        otp: string;
    }>;
    verifyOtp(phone: string, otp: string): Promise<{
        message: string;
        token: string;
        user: any;
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        user: any;
    }>;
    private sanitize;
}
