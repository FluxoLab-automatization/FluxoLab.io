import { MonitoringService } from './monitoring.service';
import { HealthCheckService } from './health-check.service';
import { MetricsService } from './metrics.service';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/env.validation';
export declare class MonitoringController {
    private readonly monitoringService;
    private readonly healthCheckService;
    private readonly metricsService;
    private readonly config;
    constructor(monitoringService: MonitoringService, healthCheckService: HealthCheckService, metricsService: MetricsService, config: ConfigService<AppConfig, true>);
    getHealth(): Promise<{
        status: string;
        health: import("./health-check.service").HealthCheckResult;
    }>;
    getSystemInfo(): Promise<{
        status: string;
        system: {
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
        };
        database: {
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
        };
        metrics: {
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
        };
    }>;
    getMetrics(): Promise<{
        status: string;
        metrics: {
            counters: import("./metrics.service").CounterMetric[];
            histograms: import("./metrics.service").HistogramMetric[];
            gauges: Record<string, number>;
        };
    }>;
    getPrometheusMetrics(): Promise<string>;
    getStatus(): Promise<{
        status: string;
        message: string;
        uptime: number;
        version: string;
        environment: any;
        timestamp: string;
    }>;
}
