import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/env.validation';
import { PasswordService } from '../../shared/auth/password.service';
import { TokenService } from '../../shared/auth/token.service';
import { mapToPresentedUser, presentAuthenticatedUser } from './auth.mapper';
import { AuthenticatedUser } from './auth.types';
import { UsersRepository } from './users.repository';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserSettingsRepository } from './user-settings.repository';
import { UserSecurityRepository } from './user-security.repository';
import { WorkspaceProvisioningService } from '../workspace/workspace-provisioning.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly config: ConfigService<AppConfig, true>,
    private readonly userSettingsRepository: UserSettingsRepository,
    private readonly userSecurityRepository: UserSecurityRepository,
    @Inject(forwardRef(() => WorkspaceProvisioningService))
    private readonly workspaceProvisioning: WorkspaceProvisioningService,
  ) {}

  async login(payload: LoginDto) {
    const user = await this.usersRepository.findByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException({
        status: 'error',
        message: 'Credenciais invalidas.',
      });
    }

    const valid = await this.passwordService.comparePassword(
      payload.password,
      user.password_hash,
    );
    if (!valid) {
      throw new UnauthorizedException({
        status: 'error',
        message: 'Credenciais invalidas.',
      });
    }

    await this.usersRepository.touchLastLogin(user.id);

    if (!user.default_workspace_id) {
      const { workspace } = await this.workspaceProvisioning.provisionInitialWorkspace({
        userId: user.id,
        assignedBy: user.id,
      });
      await this.usersRepository.setDefaultWorkspace(user.id, workspace.id);
      (user as any).default_workspace_id = workspace.id;
    }

    const token = this.tokenService.generateToken({
      sub: user.id,
      email: user.email,
      workspaceId: (user as any).default_workspace_id ?? null,
    });

    return {
      status: 'ok',
      token,
      user: mapToPresentedUser(user),
    };
  }

  async register(payload: RegisterDto) {
    const signupAccessToken = this.config.get('SIGNUP_ACCESS_TOKEN', {
      infer: true,
    });

    if (signupAccessToken && payload.accessToken !== signupAccessToken) {
      throw new ForbiddenException({
        status: 'error',
        message: 'Token de acesso invalido para registro.',
      });
    }

    const existing = await this.usersRepository.findByEmail(payload.email);
    if (existing) {
      throw new ConflictException({
        status: 'error',
        message: 'E-mail ja cadastrado.',
      });
    }

    const passwordHash = await this.passwordService.hashPassword(
      payload.password,
    );

    const avatarColor = payload.avatarColor ?? '#6366F1';

    const newUser = await this.usersRepository.createUser({
      email: payload.email,
      passwordHash,
      displayName: payload.displayName,
      avatarColor,
    });

    const [firstName, ...rest] = payload.displayName.split(' ').filter(Boolean);
    const lastName = rest.length > 0 ? rest.join(' ') : null;

    await Promise.all([
      this.userSettingsRepository.ensureUserSettings({
        userId: newUser.id,
        firstName: firstName ?? null,
        lastName,
      }),
      this.userSecurityRepository.ensureSecurityRow(newUser.id),
    ]);

    const { workspace } = await this.workspaceProvisioning.provisionInitialWorkspace({
      userId: newUser.id,
      assignedBy: newUser.id,
    });
    await this.usersRepository.setDefaultWorkspace(newUser.id, workspace.id);

    return {
      status: 'created',
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.display_name,
        avatarColor: newUser.avatar_color ?? '#6366F1',
        workspaceId: workspace.id,
      },
    };
  }

  me(user: AuthenticatedUser) {
    return {
      status: 'ok',
      user: presentAuthenticatedUser(user),
    };
  }
}



