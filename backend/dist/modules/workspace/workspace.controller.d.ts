import { WorkspaceService } from './workspace.service';
import type { AuthenticatedUser } from '../auth/auth.types';
export declare class WorkspaceController {
    private readonly workspaceService;
    constructor(workspaceService: WorkspaceService);
    getOverview(user: AuthenticatedUser): Promise<{
        status: string;
        overview: import("./workspace.service").WorkspaceOverviewResponse;
    }>;
    listProjects(user: AuthenticatedUser, limit: number): Promise<{
        status: string;
        projects: import("./workspace.service").PresentedProject[];
    }>;
    listActivities(user: AuthenticatedUser, limit: number): Promise<{
        status: string;
        activities: import("./workspace.service").PresentedActivity[];
    }>;
    listRecentWebhooks(user: AuthenticatedUser, limit: number): Promise<{
        status: string;
        events: import("./workspace.service").PresentedWebhookEvent[];
    }>;
}
