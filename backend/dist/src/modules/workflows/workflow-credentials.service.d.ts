import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../shared/database/database.service';
import { AppConfig } from '../../config/env.validation';
interface CreateCredentialParams {
    workspaceId: string;
    name: string;
    type: string;
    secret: Record<string, unknown>;
    createdBy?: string | null;
}
export interface WorkflowCredential {
    id: string;
    workspaceId: string;
    name: string;
    type: string;
    secret: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string | null;
    updatedBy?: string | null;
}
export declare class WorkflowCredentialsService {
    private readonly database;
    private readonly encryptionKey;
    constructor(database: DatabaseService, config: ConfigService<AppConfig, true>);
    private get pool();
    createCredential(params: CreateCredentialParams): Promise<WorkflowCredential>;
    getCredential(workspaceId: string, credentialId: string): Promise<WorkflowCredential | null>;
    listCredentials(workspaceId: string): Promise<WorkflowCredential[]>;
    private decryptSecret;
}
export {};
