import { DatabaseService } from '../../../shared/database/database.service';
import { UpgradePlanDto, CancelSubscriptionDto, AvailablePlan, PlanUpgradeResponse } from '../dto/plan-management.dto';
export declare class PlanManagementService {
    private readonly database;
    private readonly logger;
    constructor(database: DatabaseService);
    getAvailablePlans(): Promise<AvailablePlan[]>;
    upgradePlan(workspaceId: string, upgradeData: UpgradePlanDto): Promise<PlanUpgradeResponse>;
    cancelSubscription(workspaceId: string, cancelData: CancelSubscriptionDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getBillingHistory(workspaceId: string): Promise<any[]>;
    private calculateProratedAmount;
}
