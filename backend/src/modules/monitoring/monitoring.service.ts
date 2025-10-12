import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/env.validation';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async getSystemInfo() {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();

    return {
      timestamp: new Date().toISOString(),
      environment: this.config.get('NODE_ENV'),
      version: process.env.npm_package_version || '1.0.0',
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: {
        seconds: Math.floor(uptime),
        human: this.formatUptime(uptime),
      },
      memory: {
        rss: this.formatBytes(memoryUsage.rss),
        heapTotal: this.formatBytes(memoryUsage.heapTotal),
        heapUsed: this.formatBytes(memoryUsage.heapUsed),
        external: this.formatBytes(memoryUsage.external),
        arrayBuffers: this.formatBytes(memoryUsage.arrayBuffers),
      },
      cpu: {
        usage: await this.getCpuUsage(),
      },
    };
  }

  async getDatabaseStats() {
    // This would be implemented with actual database queries
    return {
      connections: {
        active: 0,
        idle: 0,
        total: 0,
      },
      queries: {
        total: 0,
        avgDuration: 0,
        slowQueries: 0,
      },
    };
  }

  async getApplicationMetrics() {
    return {
      requests: {
        total: 0,
        perSecond: 0,
        avgResponseTime: 0,
      },
      errors: {
        total: 0,
        rate: 0,
      },
      webhooks: {
        received: 0,
        processed: 0,
        failed: 0,
      },
    };
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${secs}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  private async getCpuUsage(): Promise<number> {
    const startUsage = process.cpuUsage();
    const startTime = Date.now();

    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUsage = process.cpuUsage(startUsage);
        const currentTime = Date.now();
        const timeDiff = (currentTime - startTime) * 1000; // Convert to microseconds
        const cpuUsage = (currentUsage.user + currentUsage.system) / timeDiff * 100;
        resolve(Math.round(cpuUsage * 100) / 100);
      }, 100);
    });
  }
}
