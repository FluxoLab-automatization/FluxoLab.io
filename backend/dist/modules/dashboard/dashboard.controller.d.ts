import type { AuthenticatedUser } from '../auth/auth.types';
import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getOverview(user: AuthenticatedUser): Promise<{
        totalWorkflows: number;
        activeWorkflows: number;
        totalExecutions: number;
        totalCredentials: number;
        lastExecutionAt: Date | null;
        trialInfo: {
            daysLeft: number;
            executionsUsed: number;
            executionsLimit: number;
            isTrial: boolean;
        };
        status: string;
    }>;
    getStats(user: AuthenticatedUser, period?: string): Promise<{
        status: string;
        stats: import("./dashboard.service").DashboardStats;
    }>;
    getWorkflows(user: AuthenticatedUser, limit?: string, offset?: string, search?: string, sortBy?: string, status?: string): Promise<{
        status: string;
        workflows: {
            workflows: import("./dashboard.service").WorkflowSummary[];
            total: number;
        };
    }>;
    getExecutions(user: AuthenticatedUser, limit?: string, offset?: string, workflowId?: string): Promise<{
        status: string;
        executions: {
            executions: import("./dashboard.service").ExecutionSummary[];
            total: number;
        };
    }>;
    getCredentials(user: AuthenticatedUser, limit?: string, offset?: string): Promise<{
        status: string;
        credentials: {
            credentials: import("./dashboard.service").CredentialSummary[];
            total: number;
        };
    }>;
}
