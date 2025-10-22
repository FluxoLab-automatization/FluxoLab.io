import { DatabaseService } from '../../shared/database/database.service';
export interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    avatarColor?: string;
    createdAt: Date;
    lastLoginAt: Date | null;
    preferences: UserPreferences;
}
export interface UserPreferences {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    notifications: {
        email: boolean;
        push: boolean;
        workflow: boolean;
    };
    dashboard: {
        defaultView: 'overview' | 'workflows' | 'executions';
        itemsPerPage: number;
    };
}
export interface TrialInfo {
    isTrial: boolean;
    daysLeft: number;
    executionsUsed: number;
    executionsLimit: number;
    planName: string;
    features: string[];
    upgradeUrl?: string;
}
export interface WorkspaceMember {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    avatarColor?: string;
    role: 'owner' | 'admin' | 'member';
    joinedAt: Date;
    lastActiveAt: Date | null;
}
export declare class UsersService {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    getUserProfile(userId: string): Promise<UserProfile>;
    updateUserProfile(userId: string, profileData: any): Promise<UserProfile>;
    getTrialInfo(userId: string): Promise<TrialInfo>;
    getWorkspaceMembers(workspaceId: string, options: {
        limit: number;
        offset: number;
    }): Promise<{
        members: WorkspaceMember[];
        total: number;
    }>;
    getUserPreferences(userId: string): Promise<UserPreferences>;
    updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences>;
    private getDefaultPreferences;
    private getPlanFeatures;
}
