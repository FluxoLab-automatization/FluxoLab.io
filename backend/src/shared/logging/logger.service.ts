import { Injectable, Logger, LoggerService as INestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/env.validation';

export interface LogContext {
  userId?: string;
  requestId?: string;
  workspaceId?: string;
  [key: string]: any;
}

@Injectable()
export class LoggerService implements INestLoggerService {
  // Use a classe Logger do Nest (tem todos os métodos concretos)
  private readonly logger = new Logger('AppLogger');

  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  log(message: string, context?: LogContext): void {
    this.logger.log(this.formatMessage(message, context));
  }

  error(message: string, trace?: string, context?: LogContext): void {
    this.logger.error(this.formatMessage(message, context), trace);
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(this.formatMessage(message, context));
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(this.formatMessage(message, context));
  }

  verbose(message: string, context?: LogContext): void {
    this.logger.verbose(this.formatMessage(message, context));
  }

  // ---- Application-specific logging ----
  logRequest(method: string, url: string, statusCode: number, duration: number, context?: LogContext): void {
    this.log(`HTTP ${method} ${url} ${statusCode} - ${duration}ms`, {
      ...context,
      method,
      url,
      statusCode,
      duration,
      type: 'request',
    });
  }

  logAuth(action: string, userId?: string, context?: LogContext): void {
    this.log(`Auth ${action}`, {
      ...context,
      userId,
      type: 'auth',
      action,
    });
  }

  logWebhook(eventType: string, status: string, duration: number, context?: LogContext): void {
    this.log(`Webhook ${eventType} ${status} - ${duration}ms`, {
      ...context,
      eventType,
      status,
      duration,
      type: 'webhook',
    });
  }

  logDatabase(operation: string, table: string, duration: number, context?: LogContext): void {
    this.log(`Database ${operation} ${table} - ${duration}ms`, {
      ...context,
      operation,
      table,
      duration,
      type: 'database',
    });
  }

  logMCP(action: string, toolName?: string, success: boolean = true, context?: LogContext): void {
    this.log(`MCP ${action} ${success ? 'success' : 'failed'}`, {
      ...context,
      action,
      toolName,
      success,
      type: 'mcp',
    });
  }

  logSecurity(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: LogContext): void {
    const msg = `Security ${event}`;
    const payload: LogContext = {
      ...context,
      event,
      severity,
      type: 'security',
    };

    if (severity === 'critical') {
      // error(message, trace?, context?)
      this.error(msg, undefined, payload);
    } else if (severity === 'high') {
      this.warn(msg, payload);
    } else {
      this.log(msg, payload);
    }
  }

  logPerformance(operation: string, duration: number, context?: LogContext): void {
    this.log(`Performance ${operation} - ${duration}ms`, {
      ...context,
      operation,
      duration,
      type: 'performance',
    });
  }

  logBusiness(event: string, context?: LogContext): void {
    this.log(`Business ${event}`, {
      ...context,
      type: 'business',
      event,
    });
  }

  private formatMessage(message: string, context?: LogContext): string {
    if (!context || Object.keys(context).length === 0) return message;

    const contextStr = Object.entries(context)
      .map(([key, value]) => `${key}=${typeof value === 'object' ? JSON.stringify(value) : value}`)
      .join(' ');

    return `${message} | ${contextStr}`;
  }

  // Structured logging for external systems
  logStructured(level: 'log' | 'warn' | 'error' | 'debug' | 'verbose', message: string, context: LogContext = {}): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: 'fluxolab-backend',
      version: process.env.npm_package_version || '1.0.0',
      environment: this.config.get('NODE_ENV'),
      ...context,
    };

    // Saída JSON para coletores (ELK, Loki, etc.)
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(logEntry));
  }

  // Error tracking with stack traces
  logError(error: Error, context?: LogContext): void {
    this.error(error.message, error.stack, {
      ...context,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      type: 'error',
    });
  }

  // Audit logging for compliance
  logAudit(action: string, resource: string, userId: string, context?: LogContext): void {
    this.log(`AUDIT ${action} ${resource}`, {
      ...context,
      action,
      resource,
      userId,
      type: 'audit',
      timestamp: new Date().toISOString(),
    });
  }
}
