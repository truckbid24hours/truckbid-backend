import { UserRole } from '@prisma/client';
export declare class RegisterDto {
    fullName: string;
    phone: string;
    email: string;
    password: string;
    role: UserRole;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class VerifyOtpDto {
    phone: string;
    otp: string;
}
