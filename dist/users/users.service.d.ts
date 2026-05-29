import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getMe(userId: string): Promise<{
        fullName: string;
        phone: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        kycStatus: import(".prisma/client").$Enums.KycStatus;
        kycDocuments: string[];
        isSuspended: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateMe(userId: string, data: {
        fullName?: string;
        email?: string;
    }): Promise<{
        fullName: string;
        phone: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        kycStatus: import(".prisma/client").$Enums.KycStatus;
    }>;
    submitKyc(userId: string, data: {
        aadhaar: string;
        pan: string;
        documents: string[];
    }): Promise<{
        id: string;
        kycStatus: import(".prisma/client").$Enums.KycStatus;
    }>;
    getKycStatus(userId: string): Promise<{
        kycStatus: import(".prisma/client").$Enums.KycStatus;
        kycDocuments: string[];
    }>;
    getAllUsers(page?: number, limit?: number): Promise<{
        users: {
            fullName: string;
            phone: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            id: string;
            kycStatus: import(".prisma/client").$Enums.KycStatus;
            isSuspended: boolean;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        pages: number;
    }>;
    suspendUser(userId: string, suspend: boolean): Promise<{
        id: string;
        isSuspended: boolean;
    }>;
    approveKyc(userId: string, approved: boolean): Promise<{
        id: string;
        kycStatus: import(".prisma/client").$Enums.KycStatus;
    }>;
}
