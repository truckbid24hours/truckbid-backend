import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, VerifyOtpDto } from './dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        message: string;
        userId: string;
        otp: string;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
        message: string;
        token: string;
        user: any;
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        user: any;
    }>;
}
