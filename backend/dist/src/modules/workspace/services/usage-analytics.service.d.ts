import { DatabaseService } from '../../../shared/database/database.service';
import { UsageHistoryQueryDto, UsageHistoryResponse } from '../dto/usage-history.dto';
export declare class UsageAnalyticsService {
    private readonly database;
    private readonly logger;
    constructor(database: DatabaseService);
    getUsageHistory(workspaceId: string, query: UsageHistoryQueryDto): Promise<UsageHistoryResponse[]>;
    private getWebhookUsageHistory;
    private getUserUsageHistory;
    private getWorkflowUsageHistory;
    private buildUsageResponse;
    private calculateDateRange;
    private getPreviousPeriod;
    private calculateGrowthRate;
    getUsageAlerts(_workspaceId: string): Promise<any[]>;
    createUsageAlert(_workspaceId: string, _alertConfig: any): Promise<any>;
}
