import { LoggerService as INestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/env.validation';
export interface LogContext {
    userId?: string;
    requestId?: string;
    workspaceId?: string;
    [key: string]: any;
}
export declare class LoggerService implements INestLoggerService {
    private readonly config;
    private readonly logger;
    constructor(config: ConfigService<AppConfig, true>);
    log(message: string, context?: LogContext): void;
    error(message: string, trace?: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    debug(message: string, context?: LogContext): void;
    verbose(message: string, context?: LogContext): void;
    logRequest(method: string, url: string, statusCode: number, duration: number, context?: LogContext): void;
    logAuth(action: string, userId?: string, context?: LogContext): void;
    logWebhook(eventType: string, status: string, duration: number, context?: LogContext): void;
    logDatabase(operation: string, table: string, duration: number, context?: LogContext): void;
    logMCP(action: string, toolName?: string, success?: boolean, context?: LogContext): void;
    logSecurity(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: LogContext): void;
    logPerformance(operation: string, duration: number, context?: LogContext): void;
    logBusiness(event: string, context?: LogContext): void;
    private formatMessage;
    logStructured(level: 'log' | 'warn' | 'error' | 'debug' | 'verbose', message: string, context?: LogContext): void;
    logError(error: Error, context?: LogContext): void;
    logAudit(action: string, resource: string, userId: string, context?: LogContext): void;
}
