import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../shared/database/database.service';
import { PasswordService } from '../../shared/auth/password.service';
import { MailerService } from '../../shared/mail/mailer.service';
import { AppConfig } from '../../config/env.validation';
export declare class PasswordResetService {
    private readonly database;
    private readonly passwordService;
    private readonly jwtService;
    private readonly mailerService;
    private readonly config;
    private readonly logger;
    private readonly codeTtlMinutes;
    private readonly resetTokenTtlMinutes;
    private readonly maxAttempts;
    private readonly maxRequestsPerHour;
    constructor(database: DatabaseService, passwordService: PasswordService, jwtService: JwtService, mailerService: MailerService, config: ConfigService<AppConfig, true>);
    private get pool();
    private generateCode;
    private isValidEmailOrCpf;
    private normalizeCpf;
    private findUserByIdentifier;
    private checkRateLimit;
    requestPasswordReset(identifier: string, ipAddress?: string, userAgent?: string): Promise<void>;
    verifyResetCode(identifier: string, code: string): Promise<string>;
    resetPassword(resetToken: string, newPassword: string): Promise<void>;
    cleanupExpiredRequests(): Promise<number>;
}
