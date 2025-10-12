import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class HealthCheckService {
  private readonly logger = new Logger(HealthCheckService.name);

  constructor(
    private readonly config: ConfigService<AppConfig, true>,
    private readonly database: DatabaseService,
  ) {}

  async checkHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const services: HealthCheckResult['services'] = {
      database: await this.checkDatabase(),
    };

    // Check Redis if configured
    if (this.config.get('REDIS_URL')) {
      services.redis = await this.checkRedis();
    }

    // Check external services
    services.external = await this.checkExternalServices();

    const responseTime = Date.now() - startTime;
    
    // Determine overall status
    const serviceStatuses = Object.values(services).map(s => s.status);
    let overallStatus: HealthCheckResult['status'];
    
    if (serviceStatuses.includes('down')) {
      overallStatus = 'unhealthy';
    } else if (serviceStatuses.includes('degraded')) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services,
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  private async checkDatabase(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      const pool = this.database.getPool();
      await pool.query('SELECT 1');
      
      return {
        status: 'up',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return {
        status: 'down',
        message: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date().toISOString(),
      };
    }
  }

  private async checkRedis(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      // This would be implemented with actual Redis client
      // For now, we'll simulate a check
      return {
        status: 'up',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.warn('Redis health check failed', error);
      return {
        status: 'degraded',
        message: error instanceof Error ? error.message : 'Redis unavailable',
        lastChecked: new Date().toISOString(),
      };
    }
  }

  private async checkExternalServices(): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      // Check external services like Sentry, email service, etc.
      const checks = [];
      
      // Check Sentry if configured
      if (this.config.get('SENTRY_DSN')) {
        checks.push(this.checkSentry());
      }
      
      // Check email service if configured
      if (this.config.get('SMTP_HOST')) {
        checks.push(this.checkEmailService());
      }

      const results = await Promise.allSettled(checks);
      const failures = results.filter(r => r.status === 'rejected');
      
      if (failures.length === 0) {
        return {
          status: 'up',
          responseTime: Date.now() - startTime,
          lastChecked: new Date().toISOString(),
        };
      } else if (failures.length < results.length) {
        return {
          status: 'degraded',
          responseTime: Date.now() - startTime,
          message: `${failures.length} external service(s) unavailable`,
          lastChecked: new Date().toISOString(),
        };
      } else {
        return {
          status: 'down',
          responseTime: Date.now() - startTime,
          message: 'All external services unavailable',
          lastChecked: new Date().toISOString(),
        };
      }
    } catch (error) {
      return {
        status: 'degraded',
        message: error instanceof Error ? error.message : 'External services check failed',
        lastChecked: new Date().toISOString(),
      };
    }
  }

  private async checkSentry(): Promise<void> {
    // Implement actual Sentry health check
    return Promise.resolve();
  }

  private async checkEmailService(): Promise<void> {
    // Implement actual email service health check
    return Promise.resolve();
  }
}
