import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../shared/database/database.service';
import { AppConfig } from '../../config/env.validation';
export interface HealthCheckResult {
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: string;
    services: {
        database: ServiceHealth;
        redis?: ServiceHealth;
        external?: ServiceHealth;
    };
    uptime: number;
    version: string;
}
export interface ServiceHealth {
    status: 'up' | 'down' | 'degraded';
    responseTime?: number;
    message?: string;
    lastChecked: string;
}
export declare class HealthCheckService {
    private readonly config;
    private readonly database;
    private readonly logger;
    constructor(config: ConfigService<AppConfig, true>, database: DatabaseService);
    checkHealth(): Promise<HealthCheckResult>;
    private checkDatabase;
    private checkRedis;
    private checkExternalServices;
    private checkSentry;
    private checkEmailService;
}
