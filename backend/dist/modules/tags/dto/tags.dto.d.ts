export declare class CreateTagDto {
    name: string;
    description?: string;
    color?: string;
    category_id?: string;
}
export declare class UpdateTagDto {
    name?: string;
    description?: string;
    color?: string;
    category_id?: string;
}
export declare class CreateTagCategoryDto {
    name: string;
    description?: string;
    color?: string;
}
export declare class UpdateTagCategoryDto {
    name?: string;
    description?: string;
    color?: string;
}
export declare class AssignTagsToWorkflowDto {
    tag_ids: string[];
}
