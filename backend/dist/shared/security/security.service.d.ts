import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/env.validation';
export declare class SecurityService {
    private readonly config;
    private readonly tokenSecret;
    constructor(config: ConfigService<AppConfig, true>);
    hashToken(token: string): string;
    maskToken(token: string | null | undefined): string;
    ensureLeadingSlash(pathValue: string | undefined | null): string;
}
