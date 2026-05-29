import { IsEmail, IsString, MinLength, IsEnum, IsMobilePhone } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @IsString() fullName: string;
  @IsString() phone: string;
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
  @IsEnum(UserRole) role: UserRole;
}

export class LoginDto {
  @IsEmail() email: string;
  @IsString() password: string;
}

export class VerifyOtpDto {
  @IsString() phone: string;
  @IsString() otp: string;
}
