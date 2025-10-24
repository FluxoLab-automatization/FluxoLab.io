export declare class TemplateInstallsService {
    private readonly logger;
    constructor();
    getTemplateInstalls(workspaceId: string, filters?: any): Promise<never[]>;
    getTemplateInstall(id: string): Promise<null>;
    createTemplateInstall(createTemplateInstallDto: any): Promise<null>;
    updateTemplateInstall(id: string, updateTemplateInstallDto: any): Promise<null>;
    deleteTemplateInstall(id: string): Promise<null>;
}
