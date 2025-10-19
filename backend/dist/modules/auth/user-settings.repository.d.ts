import { DatabaseService } from '../../shared/database/database.service';
export interface UserSettingsRecord {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    locale: string;
    timezone: string;
    theme: 'light' | 'dark' | 'system';
    notifications: Record<string, unknown> | null;
    preferences: Record<string, unknown> | null;
    updated_at: Date;
}
export declare class UserSettingsRepository {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    ensureUserSettings(params: {
        userId: string;
        firstName?: string | null;
        lastName?: string | null;
    }): Promise<void>;
}
