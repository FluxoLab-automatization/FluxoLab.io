import { ProjectSharingService } from './project-sharing.service';
import { ShareProjectDto, UpdateSharedProjectDto, CreateProjectCommentDto, GetSharedProjectsDto, ForkProjectDto } from './dto/project-sharing.dto';
export declare class ProjectSharingController {
    private readonly projectSharingService;
    constructor(projectSharingService: ProjectSharingService);
    shareProject(workflowId: string, shareProjectDto: ShareProjectDto, user: any, req: any): Promise<any>;
    getSharedProjects(query: GetSharedProjectsDto, req: any): Promise<any[]>;
    getSharedProjectByToken(token: string): Promise<any>;
    updateSharedProject(id: string, updateSharedProjectDto: UpdateSharedProjectDto, user: any, req: any): Promise<any>;
    deleteSharedProject(id: string, user: any, req: any): Promise<{
        message: string;
    }>;
    forkProject(id: string, forkProjectDto: ForkProjectDto, user: any, req: any): Promise<{
        workflow: any;
        message: string;
    }>;
    createComment(id: string, createCommentDto: CreateProjectCommentDto, user: any): Promise<any>;
    getComments(id: string): Promise<any[]>;
    toggleLike(id: string, user: any): Promise<{
        liked: boolean;
    }>;
    getLikes(id: string): Promise<{
        count: number;
    }>;
}
