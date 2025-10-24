import { DatabaseService } from '../../shared/database/database.service';
import { CreateTagDto, UpdateTagDto, CreateTagCategoryDto, UpdateTagCategoryDto, AssignTagsToWorkflowDto } from './dto/tags.dto';
export declare class TagsService {
    private readonly databaseService;
    constructor(databaseService: DatabaseService);
    createTagCategory(createTagCategoryDto: CreateTagCategoryDto): Promise<any>;
    getTagCategories(): Promise<any[]>;
    getTagCategoryById(id: string): Promise<any>;
    updateTagCategory(id: string, updateTagCategoryDto: UpdateTagCategoryDto): Promise<any>;
    deleteTagCategory(id: string): Promise<{
        message: string;
    }>;
    createTag(workspaceId: string, createTagDto: CreateTagDto, userId: string): Promise<any>;
    getTags(workspaceId: string): Promise<any[]>;
    getTagById(workspaceId: string, id: string): Promise<any>;
    updateTag(workspaceId: string, id: string, updateTagDto: UpdateTagDto, userId: string): Promise<any>;
    deleteTag(workspaceId: string, id: string): Promise<{
        message: string;
    }>;
    assignTagsToWorkflow(workspaceId: string, workflowId: string, assignTagsDto: AssignTagsToWorkflowDto): Promise<{
        message: string;
    }>;
    getWorkflowTags(workspaceId: string, workflowId: string): Promise<any[]>;
    getTagsByCategory(workspaceId: string, categoryId: string): Promise<any[]>;
}
