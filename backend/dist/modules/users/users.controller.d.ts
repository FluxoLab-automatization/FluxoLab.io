import type { AuthenticatedUser } from '../auth/auth.types';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(user: AuthenticatedUser): Promise<{
        status: string;
        profile: import("./users.service").UserProfile;
    }>;
    updateProfile(user: AuthenticatedUser, profileData: any): Promise<{
        status: string;
        profile: import("./users.service").UserProfile;
    }>;
    getTrialInfo(user: AuthenticatedUser): Promise<{
        status: string;
        trialInfo: import("./users.service").TrialInfo;
    }>;
    getWorkspaceMembers(user: AuthenticatedUser, limit?: string, offset?: string): Promise<{
        status: string;
        members: {
            members: import("./users.service").WorkspaceMember[];
            total: number;
        };
    }>;
    getUserPreferences(user: AuthenticatedUser): Promise<{
        status: string;
        preferences: import("./users.service").UserPreferences;
    }>;
    updateUserPreferences(user: AuthenticatedUser, preferences: any): Promise<{
        status: string;
        preferences: import("./users.service").UserPreferences;
    }>;
}
