import type { AuthenticatedUser } from '../auth/auth.types';
import { WorkspaceSettingsService, type WorkspaceSettingsSummary } from './workspace-settings.service';
import { UsageAnalyticsService } from './services/usage-analytics.service';
import { PlanManagementService } from './services/plan-management.service';
import { UsageHistoryQueryDto } from './dto/usage-history.dto';
import { UpgradePlanDto, CancelSubscriptionDto } from './dto/plan-management.dto';
export declare class SettingsController {
    private readonly workspaceSettingsService;
    private readonly usageAnalyticsService;
    private readonly planManagementService;
    constructor(workspaceSettingsService: WorkspaceSettingsService, usageAnalyticsService: UsageAnalyticsService, planManagementService: PlanManagementService);
    private requireWorkspaceId;
    getSettingsSummary(user: AuthenticatedUser): Promise<{
        status: 'ok';
        summary: WorkspaceSettingsSummary;
    }>;
    getUsageHistory(user: AuthenticatedUser, query: UsageHistoryQueryDto): Promise<{
        status: string;
        data: import("./dto/usage-history.dto").UsageHistoryResponse[];
    }>;
    getUsageAlerts(user: AuthenticatedUser): Promise<{
        status: string;
        alerts: any[];
    }>;
    createUsageAlert(user: AuthenticatedUser, alertConfig: any): Promise<{
        status: string;
        alert: any;
    }>;
    getAvailablePlans(): Promise<{
        status: string;
        plans: import("./dto/plan-management.dto").AvailablePlan[];
    }>;
    upgradePlan(user: AuthenticatedUser, upgradeData: UpgradePlanDto): Promise<{
        success: boolean;
        newPlan: import("./dto/plan-management.dto").AvailablePlan;
        billingInfo: {
            nextBillingDate: string;
            proratedAmount: number;
            currency: string;
        };
        message: string;
        status: string;
    }>;
    cancelSubscription(user: AuthenticatedUser, cancelData: CancelSubscriptionDto): Promise<{
        success: boolean;
        message: string;
        status: string;
    }>;
    getBillingHistory(user: AuthenticatedUser): Promise<{
        status: string;
        history: any[];
    }>;
    updateProfile(user: AuthenticatedUser, profileData: any): Promise<{
        status: string;
        message: string;
    }>;
    updateSecuritySettings(user: AuthenticatedUser, securityData: any): Promise<{
        status: string;
        message: string;
    }>;
    createApiKey(user: AuthenticatedUser, keyData: any): Promise<{
        status: string;
        message: string;
    }>;
    revokeApiKey(user: AuthenticatedUser, keyId: string): Promise<{
        status: string;
        message: string;
    }>;
    getApiKeyUsage(user: AuthenticatedUser, keyId: string): Promise<{
        status: string;
        usage: never[];
    }>;
    rotateApiKey(user: AuthenticatedUser, keyId: string): Promise<{
        status: string;
        message: string;
    }>;
}
