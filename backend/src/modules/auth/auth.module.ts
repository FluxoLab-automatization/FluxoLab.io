import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/env.validation';
import { PasswordService } from '../../shared/auth/password.service';
import { TokenService } from '../../shared/auth/token.service';
import { MailModule } from '../../shared/mail/mail.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordResetController } from './password-reset.controller';
import { PasswordResetService } from './password-reset.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RequireWorkspaceGuard } from './require-workspace.guard';
import { JwtStrategy } from './jwt.strategy';
import { UsersRepository } from './users.repository';
import { ProfilesRepository } from './profiles.repository';
import { UserSettingsRepository } from './user-settings.repository';
import { UserSecurityRepository } from './user-security.repository';
import { WorkspaceModule } from '../workspace/workspace.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => ({
        secret: config.get('JWT_SECRET', { infer: true }),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN', { infer: true }),
        },
      }),
    }),
    MailModule,
    forwardRef(() => WorkspaceModule),
  ],
  controllers: [AuthController, PasswordResetController],
  providers: [
    AuthService,
    PasswordResetService,
    UsersRepository,
    ProfilesRepository,
    PasswordService,
    TokenService,
    JwtStrategy,
    JwtAuthGuard,
    RequireWorkspaceGuard,
    UserSettingsRepository,
    UserSecurityRepository,
  ],
  exports: [
    AuthService,
    PasswordResetService,
    JwtAuthGuard,
    RequireWorkspaceGuard,
    UsersRepository,
    ProfilesRepository,
    UserSettingsRepository,
    UserSecurityRepository,
  ],
})
export class AuthModule {}

