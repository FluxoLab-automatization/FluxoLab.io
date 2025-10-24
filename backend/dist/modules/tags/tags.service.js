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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../shared/database/database.service");
let TagsService = class TagsService {
    databaseService;
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    async createTagCategory(createTagCategoryDto) {
        const { name, description, color } = createTagCategoryDto;
        const result = await this.databaseService.query(`INSERT INTO tag_categories (name, description, color)
       VALUES ($1, $2, $3)
       RETURNING *`, [name, description, color]);
        return result[0];
    }
    async getTagCategories() {
        const result = await this.databaseService.query('SELECT * FROM tag_categories ORDER BY name');
        return result;
    }
    async getTagCategoryById(id) {
        const result = await this.databaseService.query('SELECT * FROM tag_categories WHERE id = $1', [id]);
        if (result.length === 0) {
            throw new common_1.NotFoundException('Categoria não encontrada');
        }
        return result[0];
    }
    async updateTagCategory(id, updateTagCategoryDto) {
        const { name, description, color } = updateTagCategoryDto;
        const result = await this.databaseService.query(`UPDATE tag_categories 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           color = COALESCE($3, color),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`, [name, description, color, id]);
        if (result.length === 0) {
            throw new common_1.NotFoundException('Categoria não encontrada');
        }
        return result[0];
    }
    async deleteTagCategory(id) {
        const result = await this.databaseService.query('DELETE FROM tag_categories WHERE id = $1 RETURNING *', [id]);
        if (result.length === 0) {
            throw new common_1.NotFoundException('Categoria não encontrada');
        }
        return { message: 'Categoria deletada com sucesso' };
    }
    async createTag(workspaceId, createTagDto, userId) {
        const { name, description, color, category_id } = createTagDto;
        const existing = await this.databaseService.query('SELECT id FROM tags WHERE workspace_id = $1 AND name = $2', [workspaceId, name]);
        if (existing.length > 0) {
            throw new common_1.ConflictException('Já existe uma tag com este nome neste workspace');
        }
        const result = await this.databaseService.query(`INSERT INTO tags (workspace_id, name, description, color, category_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [workspaceId, name, description, color, category_id, userId]);
        return result[0];
    }
    async getTags(workspaceId) {
        const result = await this.databaseService.query(`SELECT t.*, tc.name as category_name, tc.color as category_color, u.display_name as created_by_name
       FROM tags t
       LEFT JOIN tag_categories tc ON t.category_id = tc.id
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.workspace_id = $1
       ORDER BY t.name`, [workspaceId]);
        return result;
    }
    async getTagById(workspaceId, id) {
        const result = await this.databaseService.query(`SELECT t.*, tc.name as category_name, tc.color as category_color, u.display_name as created_by_name
       FROM tags t
       LEFT JOIN tag_categories tc ON t.category_id = tc.id
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.id = $1 AND t.workspace_id = $2`, [id, workspaceId]);
        if (result.length === 0) {
            throw new common_1.NotFoundException('Tag não encontrada');
        }
        return result[0];
    }
    async updateTag(workspaceId, id, updateTagDto, userId) {
        const { name, description, color, category_id } = updateTagDto;
        if (name) {
            const existing = await this.databaseService.query('SELECT id FROM tags WHERE workspace_id = $1 AND name = $2 AND id != $3', [workspaceId, name, id]);
            if (existing.length > 0) {
                throw new common_1.ConflictException('Já existe uma tag com este nome neste workspace');
            }
        }
        const result = await this.databaseService.query(`UPDATE tags 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           color = COALESCE($3, color),
           category_id = COALESCE($4, category_id),
           updated_at = NOW()
       WHERE id = $5 AND workspace_id = $6
       RETURNING *`, [name, description, color, category_id, id, workspaceId]);
        if (result.length === 0) {
            throw new common_1.NotFoundException('Tag não encontrada');
        }
        return result[0];
    }
    async deleteTag(workspaceId, id) {
        const result = await this.databaseService.query('DELETE FROM tags WHERE id = $1 AND workspace_id = $2 RETURNING *', [id, workspaceId]);
        if (result.length === 0) {
            throw new common_1.NotFoundException('Tag não encontrada');
        }
        return { message: 'Tag deletada com sucesso' };
    }
    async assignTagsToWorkflow(workspaceId, workflowId, assignTagsDto) {
        const { tag_ids } = assignTagsDto;
        const workflow = await this.databaseService.query('SELECT id FROM workflows WHERE id = $1 AND workspace_id = $2', [workflowId, workspaceId]);
        if (workflow.length === 0) {
            throw new common_1.NotFoundException('Workflow não encontrado');
        }
        const tags = await this.databaseService.query('SELECT id FROM tags WHERE id = ANY($1) AND workspace_id = $2', [tag_ids, workspaceId]);
        if (tags.length !== tag_ids.length) {
            throw new common_1.NotFoundException('Uma ou mais tags não foram encontradas');
        }
        await this.databaseService.query('DELETE FROM workflow_tags WHERE workflow_id = $1', [workflowId]);
        if (tag_ids.length > 0) {
            const values = tag_ids.map(tagId => `('${workflowId}', '${tagId}')`).join(',');
            await this.databaseService.query(`INSERT INTO workflow_tags (workflow_id, tag_id) VALUES ${values}`);
        }
        return { message: 'Tags atribuídas com sucesso' };
    }
    async getWorkflowTags(workspaceId, workflowId) {
        const result = await this.databaseService.query(`SELECT t.*, tc.name as category_name, tc.color as category_color
       FROM workflow_tags wt
       JOIN tags t ON wt.tag_id = t.id
       LEFT JOIN tag_categories tc ON t.category_id = tc.id
       JOIN workflows w ON wt.workflow_id = w.id
       WHERE w.id = $1 AND w.workspace_id = $2
       ORDER BY t.name`, [workflowId, workspaceId]);
        return result;
    }
    async getTagsByCategory(workspaceId, categoryId) {
        const result = await this.databaseService.query(`SELECT t.*, tc.name as category_name, tc.color as category_color
       FROM tags t
       LEFT JOIN tag_categories tc ON t.category_id = tc.id
       WHERE t.workspace_id = $1 AND t.category_id = $2
       ORDER BY t.name`, [workspaceId, categoryId]);
        return result;
    }
};
exports.TagsService = TagsService;
exports.TagsService = TagsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], TagsService);
//# sourceMappingURL=tags.service.js.map