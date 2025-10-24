import { Repository } from 'typeorm';
import { Template, TemplateVersion, TemplateParam, TemplateReview } from './entities';
export declare class TemplatesService {
    private templateRepository;
    private templateVersionRepository;
    private templateParamRepository;
    private templateReviewRepository;
    private readonly logger;
    constructor(templateRepository: Repository<Template>, templateVersionRepository: Repository<TemplateVersion>, templateParamRepository: Repository<TemplateParam>, templateReviewRepository: Repository<TemplateReview>);
    findAll(filters?: {
        category?: string;
        vertical?: string;
        difficultyLevel?: string;
        isPublic?: boolean;
        isFeatured?: boolean;
        tags?: string[];
        search?: string;
    }): Promise<Template[]>;
    findOne(id: string): Promise<any>;
    findBySlug(slug: string): Promise<any>;
    getFeaturedTemplates(limit?: number): Promise<Template[]>;
    getTemplatesByVertical(vertical: string, limit?: number): Promise<Template[]>;
    getActiveVersion(templateId: string): Promise<any>;
    getParams(templateId: string): Promise<TemplateParam[]>;
    getReviews(templateId: string, limit?: number, offset?: number): Promise<{
        reviews: TemplateReview[];
        total: number;
    }>;
    getAverageRating(templateId: string): Promise<{
        average: number;
        count: number;
    }>;
    createReview(templateId: string, workspaceId: string, userId: string, rating: number, reviewText?: string): Promise<any>;
    updateReview(reviewId: string, userId: string, rating: number, reviewText?: string): Promise<any>;
    deleteReview(reviewId: string, userId: string): Promise<void>;
    getTemplateStats(templateId: string): Promise<{
        totalInstalls: number;
        activeInstalls: number;
        averageRating: number;
        reviewCount: number;
    }>;
    searchTemplates(query: string, filters?: any): Promise<Template[]>;
}
