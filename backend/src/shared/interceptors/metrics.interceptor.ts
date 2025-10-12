import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../../modules/monitoring/metrics.service';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/env.validation';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MetricsInterceptor.name);

  constructor(
    private readonly metricsService: MetricsService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url } = request;

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;
          
          // Record metrics
          this.metricsService.recordRequest(method, url, statusCode, duration);
          
          // Log slow requests
          if (duration > 1000) {
            this.logger.warn(`Slow request: ${method} ${url} took ${duration}ms`);
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;
          
          // Record error metrics
          this.metricsService.recordRequest(method, url, statusCode, duration);
          this.metricsService.recordError(
            error.name || 'UnknownError',
            'http',
          );
          
          // Log errors
          this.logger.error(
            `Request failed: ${method} ${url} - ${error.message}`,
            error.stack,
          );
        },
      }),
    );
  }
}
