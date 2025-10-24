import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/env.validation';
export declare class MailerService {
    private readonly config;
    private readonly logger;
    private transporter;
    constructor(config: ConfigService<AppConfig, true>);
    sendPasswordResetCode(to: string, name: string, code: string, expiresInMinutes?: number): Promise<void>;
    private buildPasswordResetEmailHtml;
    private buildPasswordResetEmailText;
    sendWelcomeEmail(to: string, name: string, workspaceName: string): Promise<void>;
    private buildWelcomeEmailHtml;
    private buildWelcomeEmailText;
    private send;
    verifyConnection(): Promise<boolean>;
}
