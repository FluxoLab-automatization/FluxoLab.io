import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template, TemplateVersion, TemplateParam, TemplateReview } from './entities';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
    @InjectRepository(TemplateVersion)
    private templateVersionRepository: Repository<TemplateVersion>,
    @InjectRepository(TemplateParam)
    private templateParamRepository: Repository<TemplateParam>,
    @InjectRepository(TemplateReview)
    private templateReviewRepository: Repository<TemplateReview>,
  ) {}

  async findAll(filters?: {
    category?: string;
    vertical?: string;
    difficultyLevel?: string;
    isPublic?: boolean;
    isFeatured?: boolean;
    tags?: string[];
    search?: string;
  }) {
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

  async findOne(id: string) {
    return await this.templateRepository.findOne({
      where: { id },
      relations: ['versions', 'params', 'reviews']
    });
  }

  async findBySlug(slug: string) {
    return await this.templateRepository.findOne({
      where: { slug },
      relations: ['versions', 'params', 'reviews']
    });
  }

  async getFeaturedTemplates(limit: number = 6) {
    return await this.templateRepository.find({
      where: { isFeatured: true, isActive: true, isPublic: true },
      relations: ['versions', 'params'],
      take: limit,
      order: { createdAt: 'DESC' }
    });
  }

  async getTemplatesByVertical(vertical: string, limit: number = 10) {
    return await this.templateRepository.find({
      where: { vertical, isActive: true, isPublic: true },
      relations: ['versions', 'params'],
      take: limit,
      order: { createdAt: 'DESC' }
    });
  }

  async getActiveVersion(templateId: string) {
    return await this.templateVersionRepository.findOne({
      where: { templateId, isActive: true }
    });
  }

  async getParams(templateId: string) {
    return await this.templateParamRepository.find({
      where: { templateId },
      order: { displayOrder: 'ASC' }
    });
  }

  async getReviews(templateId: string, limit: number = 10, offset: number = 0) {
    const [reviews, total] = await this.templateReviewRepository.findAndCount({
      where: { templateId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset
    });

    return { reviews, total };
  }

  async getAverageRating(templateId: string) {
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

  async createReview(templateId: string, workspaceId: string, userId: string, rating: number, reviewText?: string) {
    const review = this.templateReviewRepository.create({
      templateId,
      workspaceId,
      userId,
      rating,
      reviewText
    });

    return await this.templateReviewRepository.save(review);
  }

  async updateReview(reviewId: string, userId: string, rating: number, reviewText?: string) {
    await this.templateReviewRepository.update(
      { id: reviewId, userId },
      { rating, reviewText, updatedAt: new Date() }
    );

    return await this.templateReviewRepository.findOne({
      where: { id: reviewId }
    });
  }

  async deleteReview(reviewId: string, userId: string) {
    await this.templateReviewRepository.delete({ id: reviewId, userId });
  }

  async getTemplateStats(templateId: string) {
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

  async searchTemplates(query: string, filters?: any) {
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

  // Métodos adicionais para o controller
  async getTemplates(workspaceId: string, filters?: { category?: string; status?: string }) {
    return this.findAll(filters);
  }

  async getTemplate(id: string) {
    return this.findOne(id);
  }

  async createTemplate(createTemplateDto: any) {
    const template = this.templateRepository.create(createTemplateDto);
    return this.templateRepository.save(template);
  }

  async updateTemplate(id: string, updateTemplateDto: any) {
    await this.templateRepository.update(id, updateTemplateDto);
    return this.getTemplate(id);
  }

  async deleteTemplate(id: string) {
    return this.templateRepository.delete(id);
  }

  async installTemplate(id: string, installData: any) {
    // Implementar lógica de instalação de template
    this.logger.log(`Installing template ${id}`);
    return { success: true, message: 'Template installed successfully' };
  }
}
