export declare class ShareProjectDto {
    title: string;
    description?: string;
    permissions?: {
        view?: boolean;
        edit?: boolean;
        fork?: boolean;
    };
    access_type?: string;
    password?: string;
    expires_at?: string;
    max_views?: number;
    tags?: string[];
}
export declare class UpdateSharedProjectDto {
    title?: string;
    description?: string;
    permissions?: {
        view?: boolean;
        edit?: boolean;
        fork?: boolean;
    };
    access_type?: string;
    password?: string;
    expires_at?: string;
    max_views?: number;
    is_active?: boolean;
    tags?: string[];
}
export declare class CreateProjectPermissionDto {
    user_id?: string;
    email?: string;
    permissions?: {
        view?: boolean;
        edit?: boolean;
        fork?: boolean;
    };
}
export declare class UpdateProjectPermissionDto {
    permissions?: {
        view?: boolean;
        edit?: boolean;
        fork?: boolean;
    };
}
export declare class CreateProjectCommentDto {
    content: string;
    parent_comment_id?: string;
}
export declare class UpdateProjectCommentDto {
    content?: string;
}
export declare class GetSharedProjectsDto {
    access_type?: string;
    search?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
}
export declare class ForkProjectDto {
    name: string;
    description?: string;
}
