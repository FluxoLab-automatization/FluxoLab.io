import { TemplateInstallsService } from './template-installs.service';
export declare class TemplateInstallsController {
    private readonly templateInstallsService;
    constructor(templateInstallsService: TemplateInstallsService);
    getTemplateInstalls(workspaceId: string, templateId?: string, status?: string): Promise<never[]>;
    getTemplateInstall(id: string): Promise<null>;
    createTemplateInstall(createTemplateInstallDto: any): Promise<null>;
    updateTemplateInstall(id: string, updateTemplateInstallDto: any): Promise<null>;
    deleteTemplateInstall(id: string): Promise<null>;
}
