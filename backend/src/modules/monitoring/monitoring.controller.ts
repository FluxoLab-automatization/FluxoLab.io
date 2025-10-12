import { Controller, Get, UseGuards } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { HealthCheckService } from './health-check.service';
import { MetricsService } from './metrics.service';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/env.validation';

@Controller('api/monitoring')
export class MonitoringController {
  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly healthCheckService: HealthCheckService,
    private readonly metricsService: MetricsService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  @Get('health')
  async getHealth() {
    const health = await this.healthCheckService.checkHealth();
    return {
      status: 'ok',
      health,
    };
  }

  @Get('system')
  async getSystemInfo() {
    const systemInfo = await this.monitoringService.getSystemInfo();
    const dbStats = await this.monitoringService.getDatabaseStats();
    const appMetrics = await this.monitoringService.getApplicationMetrics();

    return {
      status: 'ok',
      system: systemInfo,
      database: dbStats,
      metrics: appMetrics,
    };
  }

  @Get('metrics')
  async getMetrics() {
    const metrics = this.metricsService.getAllMetrics();
    return {
      status: 'ok',
      metrics,
    };
  }

  @Get('metrics/prometheus')
  async getPrometheusMetrics() {
    const prometheusMetrics = this.metricsService.getPrometheusMetrics();
    
    return prometheusMetrics;
  }

  @Get('status')
  async getStatus() {
    const health = await this.healthCheckService.checkHealth();
    const systemInfo = await this.monitoringService.getSystemInfo();
    
    return {
      status: health.status === 'healthy' ? 'ok' : 'error',
      message: health.status === 'healthy' ? 'All systems operational' : 'Some services are degraded',
      uptime: systemInfo.uptime.seconds,
      version: systemInfo.version,
      environment: systemInfo.environment,
      timestamp: systemInfo.timestamp,
    };
  }
}
