import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getMe(user: any): Promise<{
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
    updateMe(user: any, body: any): Promise<{
        fullName: string;
        phone: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        id: string;
        kycStatus: import(".prisma/client").$Enums.KycStatus;
    }>;
    submitKyc(user: any, body: any): Promise<{
        id: string;
        kycStatus: import(".prisma/client").$Enums.KycStatus;
    }>;
    getKycStatus(user: any): Promise<{
        kycStatus: import(".prisma/client").$Enums.KycStatus;
        kycDocuments: string[];
    }>;
    getAllUsers(): Promise<{
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
    suspendUser(id: string, body: {
        suspend: boolean;
    }): Promise<{
        id: string;
        isSuspended: boolean;
    }>;
    approveKyc(id: string, body: {
        approved: boolean;
    }): Promise<{
        id: string;
        kycStatus: import(".prisma/client").$Enums.KycStatus;
    }>;
}
