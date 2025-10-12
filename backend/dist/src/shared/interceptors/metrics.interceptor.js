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
var MetricsInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const metrics_service_1 = require("../../modules/monitoring/metrics.service");
const config_1 = require("@nestjs/config");
let MetricsInterceptor = MetricsInterceptor_1 = class MetricsInterceptor {
    metricsService;
    config;
    logger = new common_1.Logger(MetricsInterceptor_1.name);
    constructor(metricsService, config) {
        this.metricsService = metricsService;
        this.config = config;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const { method, url } = request;
        const startTime = Date.now();
        return next.handle().pipe((0, operators_1.tap)({
            next: () => {
                const duration = Date.now() - startTime;
                const statusCode = response.statusCode;
                this.metricsService.recordRequest(method, url, statusCode, duration);
                if (duration > 1000) {
                    this.logger.warn(`Slow request: ${method} ${url} took ${duration}ms`);
                }
            },
            error: (error) => {
                const duration = Date.now() - startTime;
                const statusCode = error.status || 500;
                this.metricsService.recordRequest(method, url, statusCode, duration);
                this.metricsService.recordError(error.name || 'UnknownError', 'http');
                this.logger.error(`Request failed: ${method} ${url} - ${error.message}`, error.stack);
            },
        }));
    }
};
exports.MetricsInterceptor = MetricsInterceptor;
exports.MetricsInterceptor = MetricsInterceptor = MetricsInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [metrics_service_1.MetricsService,
        config_1.ConfigService])
], MetricsInterceptor);
//# sourceMappingURL=metrics.interceptor.js.map