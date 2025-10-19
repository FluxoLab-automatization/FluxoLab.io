import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/env.validation';
export declare class MonitoringService {
    private readonly config;
    private readonly logger;
    constructor(config: ConfigService<AppConfig, true>);
    getSystemInfo(): Promise<{
        timestamp: string;
        environment: any;
        version: string;
        nodeVersion: string;
        platform: NodeJS.Platform;
        arch: NodeJS.Architecture;
        uptime: {
            seconds: number;
            human: string;
        };
        memory: {
            rss: string;
            heapTotal: string;
            heapUsed: string;
            external: string;
            arrayBuffers: string;
        };
        cpu: {
            usage: number;
        };
    }>;
    getDatabaseStats(): Promise<{
        connections: {
            active: number;
            idle: number;
            total: number;
        };
        queries: {
            total: number;
            avgDuration: number;
            slowQueries: number;
        };
    }>;
    getApplicationMetrics(): Promise<{
        requests: {
            total: number;
            perSecond: number;
            avgResponseTime: number;
        };
        errors: {
            total: number;
            rate: number;
        };
        webhooks: {
            received: number;
            processed: number;
            failed: number;
        };
    }>;
    private formatUptime;
    private formatBytes;
    private getCpuUsage;
}
