import { TagsService } from './tags.service';
import { CreateTagDto, UpdateTagDto, CreateTagCategoryDto, UpdateTagCategoryDto, AssignTagsToWorkflowDto } from './dto/tags.dto';
export declare class TagsController {
    private readonly tagsService;
    constructor(tagsService: TagsService);
    createTagCategory(createTagCategoryDto: CreateTagCategoryDto): Promise<any>;
    getTagCategories(): Promise<any[]>;
    getTagCategoryById(id: string): Promise<any>;
    updateTagCategory(id: string, updateTagCategoryDto: UpdateTagCategoryDto): Promise<any>;
    deleteTagCategory(id: string): Promise<{
        message: string;
    }>;
    createTag(createTagDto: CreateTagDto, user: any, req: any): Promise<any>;
    getTags(req: any): Promise<any[]>;
    getTagById(id: string, req: any): Promise<any>;
    updateTag(id: string, updateTagDto: UpdateTagDto, user: any, req: any): Promise<any>;
    deleteTag(id: string, req: any): Promise<{
        message: string;
    }>;
    assignTagsToWorkflow(workflowId: string, assignTagsDto: AssignTagsToWorkflowDto, req: any): Promise<{
        message: string;
    }>;
    getWorkflowTags(workflowId: string, req: any): Promise<any[]>;
    getTagsByCategory(categoryId: string, req: any): Promise<any[]>;
}
