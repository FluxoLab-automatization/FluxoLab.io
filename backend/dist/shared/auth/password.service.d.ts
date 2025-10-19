import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/env.validation';
export declare class PasswordService {
    private readonly config;
    private readonly saltRounds;
    constructor(config: ConfigService<AppConfig, true>);
    hashPassword(password: string): Promise<string>;
    comparePassword(password: string, hash: string): Promise<boolean>;
}
