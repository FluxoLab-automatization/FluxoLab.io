import type { AuthenticatedUser } from '../auth/auth.types';
import { ConversationsRepository } from './repositories/conversations.repository';
import { ActivitiesRepository } from './repositories/activities.repository';
import { WorkspaceWebhookRepository } from './repositories/webhook-events.repository';
import { WorkspaceUsageRepository } from './repositories/workspace-usage.repository';
import { CreateProjectDto } from './dto/create-project.dto';
export interface PresentedProject {
    id: string;
    title: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    metadata: Record<string, unknown>;
}
export interface PresentedActivity {
    id: string;
    workspaceId: string;
    entityType: string;
    entityId: string | null;
    action: string;
    payload: Record<string, unknown>;
    createdAt: Date;
}
export interface PresentedWebhookEvent {
    id: string;
    type: string | null;
    status: string;
    signatureValid: boolean;
    receivedAt: Date;
}
export interface OnboardingBlock {
    id: string;
    title: string;
    steps: string[];
    completed: boolean;
}
export interface WorkspaceOverviewResponse {
    metrics: {
        totalProjects: number;
        totalWebhooks: number;
        totalEvents: number;
        activeWorkflows: number;
        activeUsers: number;
        eventsInPeriod: number;
        usagePeriodLabel: string | null;
    };
    projects: PresentedProject[];
    activities: PresentedActivity[];
    recentWebhooks: PresentedWebhookEvent[];
    onboarding: OnboardingBlock[];
}
export declare class WorkspaceService {
    private readonly conversationsRepository;
    private readonly activitiesRepository;
    private readonly webhookRepository;
    private readonly usageRepository;
    constructor(conversationsRepository: ConversationsRepository, activitiesRepository: ActivitiesRepository, webhookRepository: WorkspaceWebhookRepository, usageRepository: WorkspaceUsageRepository);
    getOverview(user: AuthenticatedUser): Promise<WorkspaceOverviewResponse>;
    listProjects(user: AuthenticatedUser, limit?: number): Promise<PresentedProject[]>;
    createProject(user: AuthenticatedUser, payload: CreateProjectDto): Promise<PresentedProject>;
    listActivities(user: AuthenticatedUser, limit?: number): Promise<PresentedActivity[]>;
    listRecentWebhooks(user: AuthenticatedUser, limit?: number): Promise<PresentedWebhookEvent[]>;
    private presentProject;
    private normalizeProjects;
    private normalizeActivities;
    private normalizeWebhooks;
    private buildOnboardingBlocks;
}
