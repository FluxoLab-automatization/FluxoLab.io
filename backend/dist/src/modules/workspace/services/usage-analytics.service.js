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
var UsageAnalyticsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../../shared/database/database.service");
const workspace_usage_alerts_repository_1 = require("../repositories/workspace-usage-alerts.repository");
let UsageAnalyticsService = UsageAnalyticsService_1 = class UsageAnalyticsService {
    database;
    usageAlerts;
    logger = new common_1.Logger(UsageAnalyticsService_1.name);
    constructor(database, usageAlerts) {
        this.database = database;
        this.usageAlerts = usageAlerts;
    }
    async getUsageHistory(workspaceId, query) {
        const { period, startDate, endDate, metric } = query;
        const dateRange = this.calculateDateRange(period ?? '30d', startDate, endDate);
        const results = [];
        if (!metric || metric === 'webhooks' || metric === 'all') {
            results.push(await this.getWebhookUsageHistory(workspaceId, dateRange));
        }
        if (!metric || metric === 'users' || metric === 'all') {
            results.push(await this.getUserUsageHistory(workspaceId, dateRange));
        }
        if (!metric || metric === 'workflows' || metric === 'all') {
            results.push(await this.getWorkflowUsageHistory(workspaceId, dateRange));
        }
        return results;
    }
    async getWebhookUsageHistory(workspaceId, dateRange) {
        const pool = this.database.getPool();
        const query = `
      SELECT 
        DATE(created_at) AS date,
        COUNT(*) AS value
      FROM webhook_events 
      WHERE workspace_id = $1 
        AND created_at >= $2 
        AND created_at <= $3
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
        const result = await pool.query(query, [workspaceId, dateRange.start, dateRange.end]);
        const data = result.rows.map((row) => {
            const dateStr = row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date);
            return {
                date: dateStr,
                value: Number(row.value),
                label: 'Webhook Events',
            };
        });
        return this.buildUsageResponse('webhooks', data, dateRange);
    }
    async getUserUsageHistory(workspaceId, dateRange) {
        const pool = this.database.getPool();
        const query = `
      SELECT 
        DATE(last_active_at) AS date,
        COUNT(DISTINCT user_id) AS value
      FROM user_sessions 
      WHERE workspace_id = $1 
        AND last_active_at >= $2 
        AND last_active_at <= $3
      GROUP BY DATE(last_active_at)
      ORDER BY date ASC
    `;
        const result = await pool.query(query, [workspaceId, dateRange.start, dateRange.end]);
        const data = result.rows.map((row) => {
            const dateStr = row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date);
            return {
                date: dateStr,
                value: Number(row.value),
                label: 'Active Users',
            };
        });
        return this.buildUsageResponse('users', data, dateRange);
    }
    async getWorkflowUsageHistory(workspaceId, dateRange) {
        const pool = this.database.getPool();
        const query = `
      SELECT 
        DATE(updated_at) AS date,
        COUNT(*) AS value
      FROM workflows 
      WHERE workspace_id = $1 
        AND status = 'active'
        AND updated_at >= $2 
        AND updated_at <= $3
      GROUP BY DATE(updated_at)
      ORDER BY date ASC
    `;
        const result = await pool.query(query, [workspaceId, dateRange.start, dateRange.end]);
        const data = result.rows.map((row) => {
            const dateStr = row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date);
            return {
                date: dateStr,
                value: Number(row.value),
                label: 'Active Workflows',
            };
        });
        return this.buildUsageResponse('workflows', data, dateRange);
    }
    buildUsageResponse(metric, data, dateRange) {
        const total = data.reduce((sum, point) => sum + point.value, 0);
        const average = data.length > 0 ? total / data.length : 0;
        const peak = Math.max(...data.map((point) => point.value), 0);
        const previousPeriod = this.getPreviousPeriod(dateRange);
        const growth = this.calculateGrowthRate(data, previousPeriod);
        return {
            metric,
            period: `${dateRange.start.toISOString().slice(0, 10)} to ${dateRange.end
                .toISOString()
                .slice(0, 10)}`,
            data,
            summary: {
                total,
                average: Math.round(average * 100) / 100,
                peak,
                growth,
            },
        };
    }
    calculateDateRange(period, startDate, endDate) {
        if (startDate || endDate || period === 'custom') {
            const start = startDate ? new Date(startDate) : new Date();
            const end = endDate ? new Date(endDate) : new Date();
            end.setHours(23, 59, 59, 999);
            return { start, end };
        }
        const now = new Date();
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);
        const match = /^(\d+)d$/.exec(period);
        const days = match ? parseInt(match[1], 10) : 30;
        const start = new Date(end);
        start.setDate(start.getDate() - days + 1);
        start.setHours(0, 0, 0, 0);
        return { start, end };
    }
    getPreviousPeriod(current) {
        const duration = current.end.getTime() - current.start.getTime();
        return {
            start: new Date(current.start.getTime() - duration),
            end: new Date(current.start.getTime()),
        };
    }
    calculateGrowthRate(_currentData, _previousPeriod) {
        return 0;
    }
    async getUsageAlerts(workspaceId) {
        const records = await this.usageAlerts.listByWorkspace(workspaceId);
        return records.map((record) => this.mapAlert(record));
    }
    async createUsageAlert(workspaceId, alertConfig) {
        const record = await this.usageAlerts.createAlert({
            workspaceId,
            metric: alertConfig.metric ?? 'webhooks',
            threshold: Number(alertConfig.threshold ?? 0),
            condition: alertConfig.condition ?? 'greater_than',
            window: alertConfig.window ?? '24h',
            channel: alertConfig.channel ?? 'email',
            createdBy: alertConfig.createdBy ?? null,
            metadata: alertConfig.metadata ?? {},
        });
        let finalRecord = record;
        if (alertConfig.enabled === false) {
            await this.usageAlerts.setEnabled(record.id, false);
            finalRecord = { ...record, enabled: false };
        }
        return this.mapAlert(finalRecord);
    }
    mapAlert(record) {
        return {
            id: record.id,
            metric: record.metric,
            threshold: Number(record.threshold),
            condition: record.condition,
            window: record.window,
            channel: record.channel,
            enabled: record.enabled,
            metadata: record.metadata ?? {},
            lastTriggeredAt: record.last_triggered_at,
            createdAt: record.created_at,
            updatedAt: record.updated_at,
        };
    }
};
exports.UsageAnalyticsService = UsageAnalyticsService;
exports.UsageAnalyticsService = UsageAnalyticsService = UsageAnalyticsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        workspace_usage_alerts_repository_1.WorkspaceUsageAlertsRepository])
], UsageAnalyticsService);
//# sourceMappingURL=usage-analytics.service.js.map