import type { AuthenticatedUser } from '../auth/auth.types';
import { WorkflowCredentialsService } from './workflow-credentials.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
export declare class WorkflowCredentialsController {
    private readonly credentialsService;
    constructor(credentialsService: WorkflowCredentialsService);
    list(user: AuthenticatedUser): Promise<{
        status: string;
        credentials: import("./workflow-credentials.service").WorkflowCredential[];
    }>;
    create(user: AuthenticatedUser, payload: CreateCredentialDto): Promise<{
        status: string;
        credential: {
            id: string;
            name: string;
            type: string;
            createdAt: Date;
        };
    }>;
}
