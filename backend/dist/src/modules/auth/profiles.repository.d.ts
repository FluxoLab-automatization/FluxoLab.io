import { DatabaseService } from '../../shared/database/database.service';
export interface ProfileRecord {
    id: string;
    code: string;
    name: string;
    description: string | null;
    scope: 'workspace' | 'global';
    created_at: Date;
    updated_at: Date;
}
export declare class ProfilesRepository {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    findByCode(code: string): Promise<ProfileRecord | null>;
    getRequiredProfileId(code: string): Promise<string>;
    assignGlobalProfile(params: {
        userId: string;
        profileCode: string;
        assignedBy?: string | null;
    }): Promise<void>;
    listWorkspaceProfiles(): Promise<ProfileRecord[]>;
}
