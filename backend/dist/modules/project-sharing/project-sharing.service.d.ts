import { DatabaseService } from '../../shared/database/database.service';
import { ShareProjectDto, UpdateSharedProjectDto, CreateProjectCommentDto, GetSharedProjectsDto, ForkProjectDto } from './dto/project-sharing.dto';
export declare class ProjectSharingService {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    shareProject(workspaceId: string, workflowId: string, userId: string, shareProjectDto: ShareProjectDto): Promise<any>;
    getSharedProjects(workspaceId: string, query: GetSharedProjectsDto): Promise<any[]>;
    getSharedProjectByToken(token: string): Promise<any>;
    updateSharedProject(workspaceId: string, sharedProjectId: string, userId: string, updateSharedProjectDto: UpdateSharedProjectDto): Promise<any>;
    deleteSharedProject(workspaceId: string, sharedProjectId: string, userId: string): Promise<{
        message: string;
    }>;
    forkProject(workspaceId: string, sharedProjectId: string, userId: string, forkProjectDto: ForkProjectDto): Promise<{
        workflow: any;
        message: string;
    }>;
    createComment(sharedProjectId: string, userId: string, createCommentDto: CreateProjectCommentDto): Promise<any>;
    getComments(sharedProjectId: string): Promise<any[]>;
    toggleLike(sharedProjectId: string, userId: string): Promise<{
        liked: boolean;
    }>;
    getLikes(sharedProjectId: string): Promise<{
        count: number;
    }>;
    private generateShareToken;
    private addTagsToSharedProject;
    private updateSharedProjectTags;
    private recordAccess;
}
