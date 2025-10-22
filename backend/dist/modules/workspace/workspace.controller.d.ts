import { WorkspaceService } from './workspace.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CreateProjectDto } from './dto/create-project.dto';
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
    createProject(user: AuthenticatedUser, payload: CreateProjectDto): Promise<{
        status: string;
        project: import("./workspace.service").PresentedProject;
    }>;
    listRecentWebhooks(user: AuthenticatedUser, limit: number): Promise<{
        status: string;
        events: import("./workspace.service").PresentedWebhookEvent[];
    }>;
}
