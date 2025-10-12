import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { MetricsService } from '../../modules/monitoring/metrics.service';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/env.validation';
export declare class MetricsInterceptor implements NestInterceptor {
    private readonly metricsService;
    private readonly config;
    private readonly logger;
    constructor(metricsService: MetricsService, config: ConfigService<AppConfig, true>);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
