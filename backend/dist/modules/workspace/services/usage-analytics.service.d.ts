import { DatabaseService } from '../../../shared/database/database.service';
import { UsageHistoryQueryDto, UsageHistoryResponse } from '../dto/usage-history.dto';
import { WorkspaceUsageAlertsRepository } from '../repositories/workspace-usage-alerts.repository';
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
    createUsageAlert(workspaceId: string, alertConfig: any): Promise<any>;
    private mapAlert;
}
