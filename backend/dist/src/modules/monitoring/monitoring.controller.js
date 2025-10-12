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
exports.MonitoringController = void 0;
const common_1 = require("@nestjs/common");
const monitoring_service_1 = require("./monitoring.service");
const health_check_service_1 = require("./health-check.service");
const metrics_service_1 = require("./metrics.service");
const config_1 = require("@nestjs/config");
let MonitoringController = class MonitoringController {
    monitoringService;
    healthCheckService;
    metricsService;
    config;
    constructor(monitoringService, healthCheckService, metricsService, config) {
        this.monitoringService = monitoringService;
        this.healthCheckService = healthCheckService;
        this.metricsService = metricsService;
        this.config = config;
    }
    async getHealth() {
        const health = await this.healthCheckService.checkHealth();
        return {
            status: 'ok',
            health,
        };
    }
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
    async getMetrics() {
        const metrics = this.metricsService.getAllMetrics();
        return {
            status: 'ok',
            metrics,
        };
    }
    async getPrometheusMetrics() {
        const prometheusMetrics = this.metricsService.getPrometheusMetrics();
        return prometheusMetrics;
    }
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
};
exports.MonitoringController = MonitoringController;
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('system'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getSystemInfo", null);
__decorate([
    (0, common_1.Get)('metrics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('metrics/prometheus'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getPrometheusMetrics", null);
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MonitoringController.prototype, "getStatus", null);
exports.MonitoringController = MonitoringController = __decorate([
    (0, common_1.Controller)('api/monitoring'),
    __metadata("design:paramtypes", [monitoring_service_1.MonitoringService,
        health_check_service_1.HealthCheckService,
        metrics_service_1.MetricsService,
        config_1.ConfigService])
], MonitoringController);
//# sourceMappingURL=monitoring.controller.js.map