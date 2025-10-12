import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { AuthenticatedUser } from './auth.types';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(payload: LoginDto): Promise<{
        status: string;
        token: string;
        user: import("./auth.types").PresentedUser;
    }>;
    register(payload: RegisterDto): Promise<{
        status: string;
        user: {
            id: string;
            email: string;
            displayName: string;
            avatarColor: string;
        };
    }>;
    me(user: AuthenticatedUser): {
        status: string;
        user: import("./auth.types").PresentedUser;
    };
}
