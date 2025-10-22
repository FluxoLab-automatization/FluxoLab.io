declare const PROJECT_STATUSES: readonly ["draft", "active", "archived"];
export declare class CreateProjectDto {
    title: string;
    description?: string;
    status?: (typeof PROJECT_STATUSES)[number];
    tags?: string[];
    icon?: string;
}
export {};
