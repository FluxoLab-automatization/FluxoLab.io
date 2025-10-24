import { Template } from './template.entity';
import { TemplateParam } from './template-param.entity';
export declare class TemplateVersion {
    id: string;
    templateId: string;
    version: string;
    isActive: boolean;
    workflowData: any;
    changelog: any;
    template: Template;
    params: TemplateParam[];
    createdAt: Date;
    updatedAt: Date;
}
