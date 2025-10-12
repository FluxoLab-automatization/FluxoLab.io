import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { MetricsService } from './metrics.service';
import { HealthCheckService } from './health-check.service';

@Module({
  imports: [ConfigModule],
  controllers: [MonitoringController],
  providers: [MonitoringService, MetricsService, HealthCheckService],
  exports: [MonitoringService, MetricsService, HealthCheckService],
})
export class MonitoringModule {}
