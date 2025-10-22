import { DatabaseService } from '../../../shared/database/database.service';
import { UsageHistoryQueryDto, UsageHistoryResponse } from '../dto/usage-history.dto';
import { WorkspaceUsageAlertsRepository } from '../repositories/workspace-usage-alerts.repository';
type UsageAlertMetric = 'webhooks' | 'users' | 'workflows';
type UsageAlertCondition = 'greater_than' | 'less_than' | 'equals';
interface CreateUsageAlertInput {
    metric: UsageAlertMetric;
    threshold: number;
    condition: UsageAlertCondition;
    window?: string;
    channel?: string;
    enabled?: boolean;
    metadata?: Record<string, unknown>;
    createdBy: string | null;
}
export declare class UsageAnalyticsService {
    private readonly database;
    private readonly usageAlerts;
    private readonly logger;
    constructor(database: DatabaseService, usageAlerts: WorkspaceUsageAlertsRepository);
    getUsageHistory(workspaceId: string, query: UsageHistoryQueryDto): Promise<UsageHistoryResponse[]>;
    private getWebhookUsageHistory;
    private getUserUsageHistory;
    private getWorkflowUsageHistory;
    private buildUsageResponse;
    private calculateDateRange;
    private getPreviousPeriod;
    private calculateGrowthRate;
    getUsageAlerts(workspaceId: string): Promise<any[]>;
    createUsageAlert(workspaceId: string, alertConfig: CreateUsageAlertInput): Promise<any>;
    private mapAlert;
}
export {};
