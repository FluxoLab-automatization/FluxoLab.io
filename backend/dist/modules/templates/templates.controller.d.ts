import { TemplatesService } from './templates.service';
export declare class TemplatesController {
    private readonly templatesService;
    constructor(templatesService: TemplatesService);
    getTemplates(workspaceId: string, category?: string, status?: string): Promise<import("./entities").Template[]>;
    getTemplate(id: string): Promise<import("./entities").Template | null>;
    createTemplate(createTemplateDto: any): Promise<import("./entities").Template[]>;
    updateTemplate(id: string, updateTemplateDto: any): Promise<import("./entities").Template | null>;
    deleteTemplate(id: string): Promise<import("typeorm").DeleteResult>;
    installTemplate(id: string, installData: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
