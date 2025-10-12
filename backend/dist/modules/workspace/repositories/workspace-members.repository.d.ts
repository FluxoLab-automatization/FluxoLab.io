import { DatabaseService } from '../../../shared/database/database.service';
export interface WorkspaceMember {
    id: string;
    workspaceId: string;
    userId: string;
    profileId: string;
    invitedBy: string | null;
    status: 'invited' | 'active' | 'suspended' | 'removed';
    joinedAt: Date | null;
    leftAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare class WorkspaceMembersRepository {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    private mapRow;
    addOrActivateMember(params: {
        workspaceId: string;
        userId: string;
        profileId: string;
        invitedBy?: string | null;
    }): Promise<WorkspaceMember>;
    countActive(workspaceId: string): Promise<number>;
}
