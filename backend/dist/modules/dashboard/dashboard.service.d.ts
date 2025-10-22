import { DatabaseService } from '../../shared/database/database.service';
export interface DashboardStats {
    prodExecutions: number;
    failedExecutions: number;
    failureRate: number;
    timeSaved: string | null;
    avgRunTime: string | null;
}
export interface DashboardOverview {
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
}
export interface WorkflowSummary {
    id: string;
    name: string;
    status: 'draft' | 'active' | 'archived';
    owner: string;
    lastUpdated: Date;
    createdAt: Date;
    executionCount: number;
    tags: string[];
}
export interface ExecutionSummary {
    id: string;
    workflowId: string;
    workflowName: string;
    status: 'running' | 'success' | 'error' | 'cancelled';
    startedAt: Date;
    finishedAt: Date | null;
    duration: number | null;
    errorMessage: string | null;
}
export interface CredentialSummary {
    id: string;
    name: string;
    type: string;
    createdAt: Date;
    lastUsedAt: Date | null;
    isActive: boolean;
}
export declare class DashboardService {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    getOverview(workspaceId: string): Promise<DashboardOverview>;
    getStats(workspaceId: string, period: string): Promise<DashboardStats>;
    getWorkflows(workspaceId: string, options: {
        limit: number;
        offset: number;
        search?: string;
        sortBy?: string;
        status?: string;
    }): Promise<{
        workflows: WorkflowSummary[];
        total: number;
    }>;
    getExecutions(workspaceId: string, options: {
        limit: number;
        offset: number;
        workflowId?: string;
    }): Promise<{
        executions: ExecutionSummary[];
        total: number;
    }>;
    getCredentials(workspaceId: string, options: {
        limit: number;
        offset: number;
    }): Promise<{
        credentials: CredentialSummary[];
        total: number;
    }>;
    private parsePeriod;
    private getSortColumn;
}
