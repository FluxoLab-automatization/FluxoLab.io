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
var MonitoringService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let MonitoringService = MonitoringService_1 = class MonitoringService {
    config;
    logger = new common_1.Logger(MonitoringService_1.name);
    constructor(config) {
        this.config = config;
    }
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
    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m ${secs}s`;
        }
        else if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        }
        else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        }
        else {
            return `${secs}s`;
        }
    }
    formatBytes(bytes) {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    }
    async getCpuUsage() {
        const startUsage = process.cpuUsage();
        const startTime = Date.now();
        return new Promise((resolve) => {
            setTimeout(() => {
                const currentUsage = process.cpuUsage(startUsage);
                const currentTime = Date.now();
                const timeDiff = (currentTime - startTime) * 1000;
                const cpuUsage = (currentUsage.user + currentUsage.system) / timeDiff * 100;
                resolve(Math.round(cpuUsage * 100) / 100);
            }, 100);
        });
    }
};
exports.MonitoringService = MonitoringService;
exports.MonitoringService = MonitoringService = MonitoringService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MonitoringService);
//# sourceMappingURL=monitoring.service.js.map