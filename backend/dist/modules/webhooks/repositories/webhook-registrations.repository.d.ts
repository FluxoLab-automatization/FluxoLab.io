import { DatabaseService } from '../../../shared/database/database.service';
export interface WebhookRegistrationRecord {
    id: string;
    user_id: string;
    token_hash: string;
    status: string;
    created_at: Date;
    verified_at: Date | null;
    revoked_at: Date | null;
    last_used_at: Date | null;
}
export declare class WebhookRegistrationsRepository {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    createRegistration(params: {
        userId: string;
        tokenHash: string;
    }): Promise<WebhookRegistrationRecord>;
    findActiveByTokenHash(tokenHash: string): Promise<WebhookRegistrationRecord | null>;
    markVerified(id: string): Promise<void>;
    updateLastUsedAt(id: string): Promise<void>;
}
