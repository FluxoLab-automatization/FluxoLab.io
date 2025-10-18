import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/env.validation';
import { PasswordService } from '../../shared/auth/password.service';
import { TokenService } from '../../shared/auth/token.service';
import { AuthenticatedUser } from './auth.types';
import { UsersRepository } from './users.repository';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserSettingsRepository } from './user-settings.repository';
import { UserSecurityRepository } from './user-security.repository';
import { WorkspaceProvisioningService } from '../workspace/workspace-provisioning.service';
export declare class AuthService {
    private readonly usersRepository;
    private readonly passwordService;
    private readonly tokenService;
    private readonly config;
    private readonly userSettingsRepository;
    private readonly userSecurityRepository;
    private readonly workspaceProvisioning;
    constructor(usersRepository: UsersRepository, passwordService: PasswordService, tokenService: TokenService, config: ConfigService<AppConfig, true>, userSettingsRepository: UserSettingsRepository, userSecurityRepository: UserSecurityRepository, workspaceProvisioning: WorkspaceProvisioningService);
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
            n: any;
            workspaceId: string;
        };
    }>;
    me(user: AuthenticatedUser): {
        status: string;
        user: import("./auth.types").PresentedUser;
    };
}
