import { Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(payload: any): Promise<{
        fullName: string;
        phone: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        passwordHash: string;
        kycStatus: import(".prisma/client").$Enums.KycStatus;
        kycDocuments: string[];
        aadhaarEnc: string | null;
        panEnc: string | null;
        isSuspended: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
