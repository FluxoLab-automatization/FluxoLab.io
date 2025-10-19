import { DatabaseService } from '../../../shared/database/database.service';
export interface WorkspaceSubscription {
    id: string;
    workspaceId: string;
    planId: string;
    status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired' | 'scheduled';
    startedAt: Date;
    trialStartsAt: Date | null;
    trialEndsAt: Date | null;
    renewsAt: Date | null;
    canceledAt: Date | null;
    cancelAtPeriodEnd: boolean;
    externalReference: string | null;
    metadata: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}
export declare class SubscriptionsRepository {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    private mapRow;
    createInitialSubscription(params: {
        workspaceId: string;
        planId: string;
        trialDays: number;
        externalReference?: string | null;
        metadata?: Record<string, unknown>;
    }): Promise<WorkspaceSubscription>;
    findActiveByWorkspace(workspaceId: string): Promise<WorkspaceSubscription | null>;
}
