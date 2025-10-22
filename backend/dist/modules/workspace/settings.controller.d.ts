import type { AuthenticatedUser } from '../auth/auth.types';
import { WorkspaceSettingsService, type WorkspaceSettingsSummary } from './workspace-settings.service';
import { UsageAnalyticsService } from './services/usage-analytics.service';
import { PlanManagementService } from './services/plan-management.service';
import { WorkspaceApiKeysService } from './services/workspace-api-keys.service';
import { WorkspaceIntegrationsService } from './services/workspace-integrations.service';
import { UsageHistoryQueryDto } from './dto/usage-history.dto';
import { UpgradePlanDto, CancelSubscriptionDto } from './dto/plan-management.dto';
import { ConfigureLdapDto, ConfigureLogDestinationDto, ConfigureSsoDto, CreateApiKeyDto, CreateUsageAlertDto, UpdateEnvironmentStatusDto, UpdateProfileDto, UpdateSecuritySettingsDto } from './dto/settings-requests.dto';
export declare class SettingsController {
    private readonly workspaceSettingsService;
    private readonly usageAnalyticsService;
    private readonly planManagementService;
    private readonly apiKeysService;
    private readonly integrationsService;
    constructor(workspaceSettingsService: WorkspaceSettingsService, usageAnalyticsService: UsageAnalyticsService, planManagementService: PlanManagementService, apiKeysService: WorkspaceApiKeysService, integrationsService: WorkspaceIntegrationsService);
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
    createUsageAlert(user: AuthenticatedUser, payload: CreateUsageAlertDto): Promise<{
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
    getIntegrationsStatus(user: AuthenticatedUser): Promise<{
        status: string;
        integrations: {
            secretProviders: import("./repositories/workspace-integrations.repository").SecretProviderRecord[];
            logDestinations: import("./repositories/workspace-integrations.repository").LogDestinationRecord[];
            ssoConfigs: import("./repositories/workspace-integrations.repository").SsoConfigRecord[];
            ldap: import("./repositories/workspace-integrations.repository").LdapConfigRecord | null;
            communityConnectors: import("./repositories/workspace-integrations.repository").CommunityConnectorRecord[];
        };
    }>;
    setEnvironmentStatus(user: AuthenticatedUser, environmentId: string, payload: UpdateEnvironmentStatusDto): Promise<{
        status: string;
        environment: import("./repositories/workspace-environments.repository").EnvironmentRecord;
    }>;
    configureSso(user: AuthenticatedUser, payload: ConfigureSsoDto): Promise<{
        status: string;
        message: string;
    }>;
    configureLdap(user: AuthenticatedUser, payload: ConfigureLdapDto): Promise<{
        status: string;
        message: string;
    }>;
    configureLogDestination(user: AuthenticatedUser, payload: ConfigureLogDestinationDto): Promise<{
        status: string;
        message: string;
    }>;
    updateProfile(user: AuthenticatedUser, _profileData: UpdateProfileDto): Promise<{
        status: string;
        message: string;
    }>;
    updateSecuritySettings(user: AuthenticatedUser, _securityData: UpdateSecuritySettingsDto): Promise<{
        status: string;
        message: string;
    }>;
    createApiKey(user: AuthenticatedUser, payload: CreateApiKeyDto): Promise<{
        status: string;
        token: string;
        key: import("./services/workspace-api-keys.service").ApiKeySummary;
    }>;
    revokeApiKey(user: AuthenticatedUser, keyId: string): Promise<{
        status: string;
        message: string;
    }>;
    getApiKeyUsage(user: AuthenticatedUser, keyId: string): Promise<{
        status: string;
        usage: import("./repositories/workspace-api-key-audit.repository").WorkspaceApiKeyAuditRecord[];
    }>;
    rotateApiKey(user: AuthenticatedUser, keyId: string): Promise<{
        status: string;
        token: string;
    }>;
}
