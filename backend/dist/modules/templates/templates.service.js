"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TemplatesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplatesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("./entities");
let TemplatesService = TemplatesService_1 = class TemplatesService {
    templateRepository;
    templateVersionRepository;
    templateParamRepository;
    templateReviewRepository;
    logger = new common_1.Logger(TemplatesService_1.name);
    constructor(templateRepository, templateVersionRepository, templateParamRepository, templateReviewRepository) {
        this.templateRepository = templateRepository;
        this.templateVersionRepository = templateVersionRepository;
        this.templateParamRepository = templateParamRepository;
        this.templateReviewRepository = templateReviewRepository;
    }
    async findAll(filters) {
        const query = this.templateRepository.createQueryBuilder('template')
            .leftJoinAndSelect('template.versions', 'versions')
            .leftJoinAndSelect('template.params', 'params')
            .where('template.isActive = true');
        if (filters?.category) {
            query.andWhere('template.category = :category', { category: filters.category });
        }
        if (filters?.vertical) {
            query.andWhere('template.vertical = :vertical', { vertical: filters.vertical });
        }
        if (filters?.difficultyLevel) {
            query.andWhere('template.difficultyLevel = :difficultyLevel', { difficultyLevel: filters.difficultyLevel });
        }
        if (filters?.isPublic !== undefined) {
            query.andWhere('template.isPublic = :isPublic', { isPublic: filters.isPublic });
        }
        if (filters?.isFeatured !== undefined) {
            query.andWhere('template.isFeatured = :isFeatured', { isFeatured: filters.isFeatured });
        }
        if (filters?.tags && filters.tags.length > 0) {
            query.andWhere('template.tags && :tags', { tags: filters.tags });
        }
        if (filters?.search) {
            query.andWhere('(template.name ILIKE :search OR template.description ILIKE :search)', {
                search: `%${filters.search}%`
            });
        }
        return await query
            .orderBy('template.isFeatured', 'DESC')
            .addOrderBy('template.createdAt', 'DESC')
            .getMany();
    }
    async findOne(id) {
        return await this.templateRepository.findOne({
            where: { id },
            relations: ['versions', 'params', 'reviews']
        });
    }
    async findBySlug(slug) {
        return await this.templateRepository.findOne({
            where: { slug },
            relations: ['versions', 'params', 'reviews']
        });
    }
    async getFeaturedTemplates(limit = 6) {
        return await this.templateRepository.find({
            where: { isFeatured: true, isActive: true, isPublic: true },
            relations: ['versions', 'params'],
            take: limit,
            order: { createdAt: 'DESC' }
        });
    }
    async getTemplatesByVertical(vertical, limit = 10) {
        return await this.templateRepository.find({
            where: { vertical, isActive: true, isPublic: true },
            relations: ['versions', 'params'],
            take: limit,
            order: { createdAt: 'DESC' }
        });
    }
    async getActiveVersion(templateId) {
        return await this.templateVersionRepository.findOne({
            where: { templateId, isActive: true }
        });
    }
    async getParams(templateId) {
        return await this.templateParamRepository.find({
            where: { templateId },
            order: { displayOrder: 'ASC' }
        });
    }
    async getReviews(templateId, limit = 10, offset = 0) {
        const [reviews, total] = await this.templateReviewRepository.findAndCount({
            where: { templateId },
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset
        });
        return { reviews, total };
    }
    async getAverageRating(templateId) {
        const result = await this.templateReviewRepository
            .createQueryBuilder('review')
            .select('AVG(review.rating)', 'average')
            .addSelect('COUNT(review.id)', 'count')
            .where('review.templateId = :templateId', { templateId })
            .getRawOne();
        return {
            average: parseFloat(result.average) || 0,
            count: parseInt(result.count) || 0
        };
    }
    async createReview(templateId, workspaceId, userId, rating, reviewText) {
        const review = this.templateReviewRepository.create({
            templateId,
            workspaceId,
            userId,
            rating,
            reviewText
        });
        return await this.templateReviewRepository.save(review);
    }
    async updateReview(reviewId, userId, rating, reviewText) {
        await this.templateReviewRepository.update({ id: reviewId, userId }, { rating, reviewText, updatedAt: new Date() });
        return await this.templateReviewRepository.findOne({
            where: { id: reviewId }
        });
    }
    async deleteReview(reviewId, userId) {
        await this.templateReviewRepository.delete({ id: reviewId, userId });
    }
    async getTemplateStats(templateId) {
        const [installs, reviews] = await Promise.all([
            this.templateRepository
                .createQueryBuilder('template')
                .leftJoin('template.installs', 'installs')
                .select('COUNT(installs.id)', 'totalInstalls')
                .addSelect('COUNT(CASE WHEN installs.status = "installed" THEN 1 END)', 'activeInstalls')
                .where('template.id = :templateId', { templateId })
                .getRawOne(),
            this.getAverageRating(templateId)
        ]);
        return {
            totalInstalls: parseInt(installs.totalInstalls) || 0,
            activeInstalls: parseInt(installs.activeInstalls) || 0,
            averageRating: reviews.average,
            reviewCount: reviews.count
        };
    }
    async searchTemplates(query, filters) {
        const searchQuery = this.templateRepository.createQueryBuilder('template')
            .leftJoinAndSelect('template.versions', 'versions')
            .leftJoinAndSelect('template.params', 'params')
            .where('template.isActive = true')
            .andWhere('(template.name ILIKE :query OR template.description ILIKE :query OR template.tags::text ILIKE :query)', {
            query: `%${query}%`
        });
        if (filters?.category) {
            searchQuery.andWhere('template.category = :category', { category: filters.category });
        }
        if (filters?.vertical) {
            searchQuery.andWhere('template.vertical = :vertical', { vertical: filters.vertical });
        }
        if (filters?.difficultyLevel) {
            searchQuery.andWhere('template.difficultyLevel = :difficultyLevel', { difficultyLevel: filters.difficultyLevel });
        }
        return await searchQuery
            .orderBy('template.isFeatured', 'DESC')
            .addOrderBy('template.createdAt', 'DESC')
            .getMany();
    }
};
exports.TemplatesService = TemplatesService;
exports.TemplatesService = TemplatesService = TemplatesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Template)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.TemplateVersion)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.TemplateParam)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.TemplateReview)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TemplatesService);
//# sourceMappingURL=templates.service.js.map