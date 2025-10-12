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
var HealthCheckService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthCheckService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const database_service_1 = require("../../shared/database/database.service");
let HealthCheckService = HealthCheckService_1 = class HealthCheckService {
    config;
    database;
    logger = new common_1.Logger(HealthCheckService_1.name);
    constructor(config, database) {
        this.config = config;
        this.database = database;
    }
    async checkHealth() {
        const startTime = Date.now();
        const services = {
            database: await this.checkDatabase(),
        };
        if (this.config.get('REDIS_URL')) {
            services.redis = await this.checkRedis();
        }
        services.external = await this.checkExternalServices();
        const responseTime = Date.now() - startTime;
        const serviceStatuses = Object.values(services).map(s => s.status);
        let overallStatus;
        if (serviceStatuses.includes('down')) {
            overallStatus = 'unhealthy';
        }
        else if (serviceStatuses.includes('degraded')) {
            overallStatus = 'degraded';
        }
        else {
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
    async checkDatabase() {
        const startTime = Date.now();
        try {
            const pool = this.database.getPool();
            await pool.query('SELECT 1');
            return {
                status: 'up',
                responseTime: Date.now() - startTime,
                lastChecked: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Database health check failed', error);
            return {
                status: 'down',
                message: error instanceof Error ? error.message : 'Unknown error',
                lastChecked: new Date().toISOString(),
            };
        }
    }
    async checkRedis() {
        const startTime = Date.now();
        try {
            return {
                status: 'up',
                responseTime: Date.now() - startTime,
                lastChecked: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.warn('Redis health check failed', error);
            return {
                status: 'degraded',
                message: error instanceof Error ? error.message : 'Redis unavailable',
                lastChecked: new Date().toISOString(),
            };
        }
    }
    async checkExternalServices() {
        const startTime = Date.now();
        try {
            const checks = [];
            if (this.config.get('SENTRY_DSN')) {
                checks.push(this.checkSentry());
            }
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
            }
            else if (failures.length < results.length) {
                return {
                    status: 'degraded',
                    responseTime: Date.now() - startTime,
                    message: `${failures.length} external service(s) unavailable`,
                    lastChecked: new Date().toISOString(),
                };
            }
            else {
                return {
                    status: 'down',
                    responseTime: Date.now() - startTime,
                    message: 'All external services unavailable',
                    lastChecked: new Date().toISOString(),
                };
            }
        }
        catch (error) {
            return {
                status: 'degraded',
                message: error instanceof Error ? error.message : 'External services check failed',
                lastChecked: new Date().toISOString(),
            };
        }
    }
    async checkSentry() {
        return Promise.resolve();
    }
    async checkEmailService() {
        return Promise.resolve();
    }
};
exports.HealthCheckService = HealthCheckService;
exports.HealthCheckService = HealthCheckService = HealthCheckService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        database_service_1.DatabaseService])
], HealthCheckService);
//# sourceMappingURL=health-check.service.js.map