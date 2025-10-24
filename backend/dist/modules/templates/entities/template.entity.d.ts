import { TemplateVersion } from './template-version.entity';
export declare class Template {
    id: string;
    name: string;
    description: string;
    category: string;
    slug: string;
    isActive: boolean;
    isPublic: boolean;
    isFeatured: boolean;
    vertical: string;
    installCount: number;
    rating: number;
    metadata: any;
    versions: TemplateVersion[];
    createdAt: Date;
    updatedAt: Date;
}
