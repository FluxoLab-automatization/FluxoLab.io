import { TemplateVersion } from './template-version.entity';
export declare class TemplateParam {
    id: string;
    templateVersionId: string;
    templateId: string;
    name: string;
    type: string;
    isRequired: boolean;
    defaultValue: string;
    description: string;
    displayOrder: number;
    validation: any;
    templateVersion: TemplateVersion;
    createdAt: Date;
    updatedAt: Date;
}
