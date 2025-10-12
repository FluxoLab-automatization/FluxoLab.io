"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let LoggerService = class LoggerService {
    config;
    logger = new common_1.Logger('AppLogger');
    constructor(config) {
        this.config = config;
    }
    log(message, context) {
        this.logger.log(this.formatMessage(message, context));
    }
    error(message, trace, context) {
        this.logger.error(this.formatMessage(message, context), trace);
    }
    warn(message, context) {
        this.logger.warn(this.formatMessage(message, context));
    }
    debug(message, context) {
        this.logger.debug(this.formatMessage(message, context));
    }
    verbose(message, context) {
        this.logger.verbose(this.formatMessage(message, context));
    }
    logRequest(method, url, statusCode, duration, context) {
        this.log(`HTTP ${method} ${url} ${statusCode} - ${duration}ms`, {
            ...context,
            method,
            url,
            statusCode,
            duration,
            type: 'request',
        });
    }
    logAuth(action, userId, context) {
        this.log(`Auth ${action}`, {
            ...context,
            userId,
            type: 'auth',
            action,
        });
    }
    logWebhook(eventType, status, duration, context) {
        this.log(`Webhook ${eventType} ${status} - ${duration}ms`, {
            ...context,
            eventType,
            status,
            duration,
            type: 'webhook',
        });
    }
    logDatabase(operation, table, duration, context) {
        this.log(`Database ${operation} ${table} - ${duration}ms`, {
            ...context,
            operation,
            table,
            duration,
            type: 'database',
        });
    }
    logMCP(action, toolName, success = true, context) {
        this.log(`MCP ${action} ${success ? 'success' : 'failed'}`, {
            ...context,
            action,
            toolName,
            success,
            type: 'mcp',
        });
    }
    logSecurity(event, severity, context) {
        const msg = `Security ${event}`;
        const payload = {
            ...context,
            event,
            severity,
            type: 'security',
        };
        if (severity === 'critical') {
            this.error(msg, undefined, payload);
        }
        else if (severity === 'high') {
            this.warn(msg, payload);
        }
        else {
            this.log(msg, payload);
        }
    }
    logPerformance(operation, duration, context) {
        this.log(`Performance ${operation} - ${duration}ms`, {
            ...context,
            operation,
            duration,
            type: 'performance',
        });
    }
    logBusiness(event, context) {
        this.log(`Business ${event}`, {
            ...context,
            type: 'business',
            event,
        });
    }
    formatMessage(message, context) {
        if (!context || Object.keys(context).length === 0)
            return message;
        const contextStr = Object.entries(context)
            .map(([key, value]) => `${key}=${typeof value === 'object' ? JSON.stringify(value) : value}`)
            .join(' ');
        return `${message} | ${contextStr}`;
    }
    logStructured(level, message, context = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            service: 'fluxolab-backend',
            version: process.env.npm_package_version || '1.0.0',
            environment: this.config.get('NODE_ENV'),
            ...context,
        };
        console.log(JSON.stringify(logEntry));
    }
    logError(error, context) {
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
    logAudit(action, resource, userId, context) {
        this.log(`AUDIT ${action} ${resource}`, {
            ...context,
            action,
            resource,
            userId,
            type: 'audit',
            timestamp: new Date().toISOString(),
        });
    }
};
exports.LoggerService = LoggerService;
exports.LoggerService = LoggerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LoggerService);
//# sourceMappingURL=logger.service.js.map