"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectSharingService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../shared/database/database.service");
const crypto = __importStar(require("crypto"));
let ProjectSharingService = class ProjectSharingService {
    databaseService;
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    async shareProject(workspaceId, workflowId, userId, shareProjectDto) {
        const { title, description, permissions, access_type, password, expires_at, max_views, tags } = shareProjectDto;
        const workflow = await this.databaseService.query('SELECT id FROM workflows WHERE id = $1 AND workspace_id = $2', [workflowId, workspaceId]);
        if (workflow.length === 0) {
            throw new common_1.NotFoundException('Workflow não encontrado');
        }
        const shareToken = this.generateShareToken();
        const passwordHash = password ? crypto.createHash('sha256').update(password).digest('hex') : null;
        const result = await this.databaseService.query(`INSERT INTO shared_projects (workspace_id, workflow_id, share_token, title, description, permissions, access_type, password_hash, expires_at, max_views, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`, [workspaceId, workflowId, shareToken, title, description, permissions || { view: true, edit: false, fork: true }, access_type, passwordHash, expires_at, max_views, userId]);
        const sharedProject = result[0];
        if (tags && tags.length > 0) {
            await this.addTagsToSharedProject(sharedProject.id, tags);
        }
        return {
            ...sharedProject,
            share_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${shareToken}`
        };
    }
    async getSharedProjects(workspaceId, query) {
        const { access_type, search, tags, limit, offset } = query;
        let whereClause = 'WHERE sp.workspace_id = $1';
        const params = [workspaceId];
        let paramIndex = 2;
        if (access_type) {
            whereClause += ` AND sp.access_type = $${paramIndex}`;
            params.push(access_type);
            paramIndex++;
        }
        if (search) {
            whereClause += ` AND (sp.title ILIKE $${paramIndex} OR sp.description ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        if (tags && tags.length > 0) {
            whereClause += ` AND EXISTS (
        SELECT 1 FROM shared_project_tags spt 
        JOIN tags t ON spt.tag_id = t.id 
        WHERE spt.shared_project_id = sp.id AND t.name = ANY($${paramIndex})
      )`;
            params.push(tags);
            paramIndex++;
        }
        const result = await this.databaseService.query(`SELECT sp.*, 
              w.name as workflow_name,
              u.display_name as created_by_name,
              COUNT(spt.tag_id) as tag_count
       FROM shared_projects sp
       LEFT JOIN workflows w ON sp.workflow_id = w.id
       LEFT JOIN users u ON sp.created_by = u.id
       LEFT JOIN shared_project_tags spt ON sp.id = spt.shared_project_id
       ${whereClause}
       GROUP BY sp.id, w.name, u.display_name
       ORDER BY sp.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`, [...params, limit, offset]);
        return result;
    }
    async getSharedProjectByToken(token) {
        const result = await this.databaseService.query(`SELECT sp.*, 
              w.name as workflow_name,
              w.definition as workflow_definition,
              u.display_name as created_by_name
       FROM shared_projects sp
       LEFT JOIN workflows w ON sp.workflow_id = w.id
       LEFT JOIN users u ON sp.created_by = u.id
       WHERE sp.share_token = $1 AND sp.is_active = true
       AND (sp.expires_at IS NULL OR sp.expires_at > NOW())
       AND (sp.max_views IS NULL OR sp.view_count < sp.max_views)`, [token]);
        if (result.length === 0) {
            throw new common_1.NotFoundException('Projeto compartilhado não encontrado ou expirado');
        }
        const sharedProject = result[0];
        await this.databaseService.query('UPDATE shared_projects SET view_count = view_count + 1 WHERE id = $1', [sharedProject.id]);
        await this.recordAccess(sharedProject.id, null, 'view');
        return sharedProject;
    }
    async updateSharedProject(workspaceId, sharedProjectId, userId, updateSharedProjectDto) {
        const { title, description, permissions, access_type, password, expires_at, max_views, is_active, tags } = updateSharedProjectDto;
        const existing = await this.databaseService.query('SELECT id FROM shared_projects WHERE id = $1 AND workspace_id = $2 AND created_by = $3', [sharedProjectId, workspaceId, userId]);
        if (existing.length === 0) {
            throw new common_1.NotFoundException('Projeto compartilhado não encontrado');
        }
        const passwordHash = password ? crypto.createHash('sha256').update(password).digest('hex') : null;
        const result = await this.databaseService.query(`UPDATE shared_projects 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           permissions = COALESCE($3, permissions),
           access_type = COALESCE($4, access_type),
           password_hash = COALESCE($5, password_hash),
           expires_at = COALESCE($6, expires_at),
           max_views = COALESCE($7, max_views),
           is_active = COALESCE($8, is_active),
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`, [title, description, permissions, access_type, passwordHash, expires_at, max_views, is_active, sharedProjectId]);
        if (tags) {
            await this.updateSharedProjectTags(sharedProjectId, tags);
        }
        return result[0];
    }
    async deleteSharedProject(workspaceId, sharedProjectId, userId) {
        const result = await this.databaseService.query('DELETE FROM shared_projects WHERE id = $1 AND workspace_id = $2 AND created_by = $3 RETURNING *', [sharedProjectId, workspaceId, userId]);
        if (result.length === 0) {
            throw new common_1.NotFoundException('Projeto compartilhado não encontrado');
        }
        return { message: 'Projeto compartilhado deletado com sucesso' };
    }
    async forkProject(workspaceId, sharedProjectId, userId, forkProjectDto) {
        const { name, description } = forkProjectDto;
        const sharedProject = await this.databaseService.query('SELECT * FROM shared_projects WHERE id = $1 AND is_active = true', [sharedProjectId]);
        if (sharedProject.length === 0) {
            throw new common_1.NotFoundException('Projeto compartilhado não encontrado');
        }
        if (!sharedProject[0].permissions.fork) {
            throw new common_1.ForbiddenException('Este projeto não permite fork');
        }
        const workflow = await this.databaseService.query('SELECT definition FROM workflows WHERE id = $1', [sharedProject[0].workflow_id]);
        if (workflow.length === 0) {
            throw new common_1.NotFoundException('Workflow original não encontrado');
        }
        const newWorkflow = await this.databaseService.query(`INSERT INTO workflows (workspace_id, name, status, definition, created_by)
       VALUES ($1, $2, 'draft', $3, $4)
       RETURNING *`, [workspaceId, name, workflow[0].definition, userId]);
        await this.databaseService.query(`INSERT INTO forked_projects (original_shared_project_id, new_workflow_id, forked_by)
       VALUES ($1, $2, $3)`, [sharedProjectId, newWorkflow[0].id, userId]);
        return {
            workflow: newWorkflow[0],
            message: 'Projeto forked com sucesso'
        };
    }
    async createComment(sharedProjectId, userId, createCommentDto) {
        const { content, parent_comment_id } = createCommentDto;
        const result = await this.databaseService.query(`INSERT INTO shared_project_comments (shared_project_id, user_id, parent_comment_id, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`, [sharedProjectId, userId, parent_comment_id, content]);
        return result[0];
    }
    async getComments(sharedProjectId) {
        const result = await this.databaseService.query(`SELECT c.*, u.display_name as user_name
       FROM shared_project_comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.shared_project_id = $1 AND c.is_approved = true
       ORDER BY c.created_at ASC`, [sharedProjectId]);
        return result;
    }
    async toggleLike(sharedProjectId, userId) {
        const existing = await this.databaseService.query('SELECT 1 FROM shared_project_likes WHERE shared_project_id = $1 AND user_id = $2', [sharedProjectId, userId]);
        if (existing.length > 0) {
            await this.databaseService.query('DELETE FROM shared_project_likes WHERE shared_project_id = $1 AND user_id = $2', [sharedProjectId, userId]);
            return { liked: false };
        }
        else {
            await this.databaseService.query('INSERT INTO shared_project_likes (shared_project_id, user_id) VALUES ($1, $2)', [sharedProjectId, userId]);
            return { liked: true };
        }
    }
    async getLikes(sharedProjectId) {
        const result = await this.databaseService.query(`SELECT COUNT(*) as count FROM shared_project_likes WHERE shared_project_id = $1`, [sharedProjectId]);
        return { count: parseInt(result[0].count) };
    }
    generateShareToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    async addTagsToSharedProject(sharedProjectId, tagNames) {
        for (const tagName of tagNames) {
            const tag = await this.databaseService.query('SELECT id FROM tags WHERE name = $1', [tagName]);
            if (tag.length > 0) {
                await this.databaseService.query('INSERT INTO shared_project_tags (shared_project_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [sharedProjectId, tag[0].id]);
            }
        }
    }
    async updateSharedProjectTags(sharedProjectId, tagNames) {
        await this.databaseService.query('DELETE FROM shared_project_tags WHERE shared_project_id = $1', [sharedProjectId]);
        await this.addTagsToSharedProject(sharedProjectId, tagNames);
    }
    async recordAccess(sharedProjectId, userId, action, ipAddress, userAgent) {
        await this.databaseService.query(`INSERT INTO shared_project_access_logs (shared_project_id, user_id, ip_address, user_agent, action)
       VALUES ($1, $2, $3, $4, $5)`, [sharedProjectId, userId, ipAddress, userAgent, action]);
    }
};
exports.ProjectSharingService = ProjectSharingService;
exports.ProjectSharingService = ProjectSharingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ProjectSharingService);
//# sourceMappingURL=project-sharing.service.js.map