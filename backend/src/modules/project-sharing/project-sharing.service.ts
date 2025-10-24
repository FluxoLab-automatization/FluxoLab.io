import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../shared/database/database.service';
import { ShareProjectDto, UpdateSharedProjectDto, CreateProjectPermissionDto, UpdateProjectPermissionDto, CreateProjectCommentDto, UpdateProjectCommentDto, GetSharedProjectsDto, ForkProjectDto } from './dto/project-sharing.dto';
import * as crypto from 'crypto';

@Injectable()
export class ProjectSharingService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Compartilhar projeto
  async shareProject(workspaceId: string, workflowId: string, userId: string, shareProjectDto: ShareProjectDto) {
    const { title, description, permissions, access_type, password, expires_at, max_views, tags } = shareProjectDto;
    
    // Verificar se o workflow existe no workspace
    const workflow = await this.databaseService.query(
      'SELECT id FROM workflows WHERE id = $1 AND workspace_id = $2',
      [workflowId, workspaceId]
    );

    if (workflow.length === 0) {
      throw new NotFoundException('Workflow não encontrado');
    }

    // Gerar token de compartilhamento
    const shareToken = this.generateShareToken();
    
    // Hash da senha se fornecida
    const passwordHash = password ? crypto.createHash('sha256').update(password).digest('hex') : null;

    const result = await this.databaseService.query(
      `INSERT INTO shared_projects (workspace_id, workflow_id, share_token, title, description, permissions, access_type, password_hash, expires_at, max_views, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [workspaceId, workflowId, shareToken, title, description, permissions || { view: true, edit: false, fork: true }, access_type, passwordHash, expires_at, max_views, userId]
    );

    const sharedProject = result[0];

    // Adicionar tags se fornecidas
    if (tags && tags.length > 0) {
      await this.addTagsToSharedProject(sharedProject.id, tags);
    }

    return {
      ...sharedProject,
      share_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${shareToken}`
    };
  }

  // Listar projetos compartilhados
  async getSharedProjects(workspaceId: string, query: GetSharedProjectsDto) {
    const { access_type, search, tags, limit, offset } = query;
    
    let whereClause = 'WHERE sp.workspace_id = $1';
    const params: any[] = [workspaceId];
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

    const result = await this.databaseService.query(
      `SELECT sp.*, 
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
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    return result;
  }

  // Obter projeto compartilhado por token
  async getSharedProjectByToken(token: string) {
    const result = await this.databaseService.query(
      `SELECT sp.*, 
              w.name as workflow_name,
              w.definition as workflow_definition,
              u.display_name as created_by_name
       FROM shared_projects sp
       LEFT JOIN workflows w ON sp.workflow_id = w.id
       LEFT JOIN users u ON sp.created_by = u.id
       WHERE sp.share_token = $1 AND sp.is_active = true
       AND (sp.expires_at IS NULL OR sp.expires_at > NOW())
       AND (sp.max_views IS NULL OR sp.view_count < sp.max_views)`,
      [token]
    );

    if (result.length === 0) {
      throw new NotFoundException('Projeto compartilhado não encontrado ou expirado');
    }

    const sharedProject = result[0];

    // Incrementar contador de visualizações
    await this.databaseService.query(
      'UPDATE shared_projects SET view_count = view_count + 1 WHERE id = $1',
      [sharedProject.id]
    );

    // Registrar acesso
    await this.recordAccess(sharedProject.id, null, 'view');

    return sharedProject;
  }

  // Atualizar projeto compartilhado
  async updateSharedProject(workspaceId: string, sharedProjectId: string, userId: string, updateSharedProjectDto: UpdateSharedProjectDto) {
    const {
      title, description, permissions, access_type, password, expires_at, max_views, is_active, tags
    } = updateSharedProjectDto;

    // Verificar se o projeto compartilhado existe e pertence ao usuário
    const existing = await this.databaseService.query(
      'SELECT id FROM shared_projects WHERE id = $1 AND workspace_id = $2 AND created_by = $3',
      [sharedProjectId, workspaceId, userId]
    );

    if (existing.length === 0) {
      throw new NotFoundException('Projeto compartilhado não encontrado');
    }

    // Hash da senha se fornecida
    const passwordHash = password ? crypto.createHash('sha256').update(password).digest('hex') : null;

    const result = await this.databaseService.query(
      `UPDATE shared_projects 
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
       RETURNING *`,
      [title, description, permissions, access_type, passwordHash, expires_at, max_views, is_active, sharedProjectId]
    );

    // Atualizar tags se fornecidas
    if (tags) {
      await this.updateSharedProjectTags(sharedProjectId, tags);
    }

    return result[0];
  }

  // Deletar projeto compartilhado
  async deleteSharedProject(workspaceId: string, sharedProjectId: string, userId: string) {
    const result = await this.databaseService.query(
      'DELETE FROM shared_projects WHERE id = $1 AND workspace_id = $2 AND created_by = $3 RETURNING *',
      [sharedProjectId, workspaceId, userId]
    );

    if (result.length === 0) {
      throw new NotFoundException('Projeto compartilhado não encontrado');
    }

    return { message: 'Projeto compartilhado deletado com sucesso' };
  }

  // Fork de projeto
  async forkProject(workspaceId: string, sharedProjectId: string, userId: string, forkProjectDto: ForkProjectDto) {
    const { name, description } = forkProjectDto;
    
    // Obter o projeto compartilhado
    const sharedProject = await this.databaseService.query(
      'SELECT * FROM shared_projects WHERE id = $1 AND is_active = true',
      [sharedProjectId]
    );

    if (sharedProject.length === 0) {
      throw new NotFoundException('Projeto compartilhado não encontrado');
    }

    // Verificar permissão de fork
    if (!sharedProject[0].permissions.fork) {
      throw new ForbiddenException('Este projeto não permite fork');
    }

    // Obter definição do workflow original
    const workflow = await this.databaseService.query(
      'SELECT definition FROM workflows WHERE id = $1',
      [sharedProject[0].workflow_id]
    );

    if (workflow.length === 0) {
      throw new NotFoundException('Workflow original não encontrado');
    }

    // Criar novo workflow
    const newWorkflow = await this.databaseService.query(
      `INSERT INTO workflows (workspace_id, name, status, definition, created_by)
       VALUES ($1, $2, 'draft', $3, $4)
       RETURNING *`,
      [workspaceId, name, workflow[0].definition, userId]
    );

    // Registrar fork
    await this.databaseService.query(
      `INSERT INTO forked_projects (original_shared_project_id, new_workflow_id, forked_by)
       VALUES ($1, $2, $3)`,
      [sharedProjectId, newWorkflow[0].id, userId]
    );

    return {
      workflow: newWorkflow[0],
      message: 'Projeto forked com sucesso'
    };
  }

  // Comentários
  async createComment(sharedProjectId: string, userId: string, createCommentDto: CreateProjectCommentDto) {
    const { content, parent_comment_id } = createCommentDto;
    
    const result = await this.databaseService.query(
      `INSERT INTO shared_project_comments (shared_project_id, user_id, parent_comment_id, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [sharedProjectId, userId, parent_comment_id, content]
    );

    return result[0];
  }

  async getComments(sharedProjectId: string) {
    const result = await this.databaseService.query(
      `SELECT c.*, u.display_name as user_name
       FROM shared_project_comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.shared_project_id = $1 AND c.is_approved = true
       ORDER BY c.created_at ASC`,
      [sharedProjectId]
    );

    return result;
  }

  // Likes
  async toggleLike(sharedProjectId: string, userId: string) {
    // Verificar se já existe like
    const existing = await this.databaseService.query(
      'SELECT 1 FROM shared_project_likes WHERE shared_project_id = $1 AND user_id = $2',
      [sharedProjectId, userId]
    );

    if (existing.length > 0) {
      // Remover like
      await this.databaseService.query(
        'DELETE FROM shared_project_likes WHERE shared_project_id = $1 AND user_id = $2',
        [sharedProjectId, userId]
      );
      return { liked: false };
    } else {
      // Adicionar like
      await this.databaseService.query(
        'INSERT INTO shared_project_likes (shared_project_id, user_id) VALUES ($1, $2)',
        [sharedProjectId, userId]
      );
      return { liked: true };
    }
  }

  async getLikes(sharedProjectId: string) {
    const result = await this.databaseService.query(
      `SELECT COUNT(*) as count FROM shared_project_likes WHERE shared_project_id = $1`,
      [sharedProjectId]
    );

    return { count: parseInt(result[0].count) };
  }

  // Métodos auxiliares
  private generateShareToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private async addTagsToSharedProject(sharedProjectId: string, tagNames: string[]) {
    for (const tagName of tagNames) {
      // Buscar ou criar tag
      const tag = await this.databaseService.query(
        'SELECT id FROM tags WHERE name = $1',
        [tagName]
      );

      if (tag.length > 0) {
        await this.databaseService.query(
          'INSERT INTO shared_project_tags (shared_project_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [sharedProjectId, tag[0].id]
        );
      }
    }
  }

  private async updateSharedProjectTags(sharedProjectId: string, tagNames: string[]) {
    // Remover tags existentes
    await this.databaseService.query(
      'DELETE FROM shared_project_tags WHERE shared_project_id = $1',
      [sharedProjectId]
    );

    // Adicionar novas tags
    await this.addTagsToSharedProject(sharedProjectId, tagNames);
  }

  private async recordAccess(sharedProjectId: string, userId: string | null, action: string, ipAddress?: string, userAgent?: string) {
    await this.databaseService.query(
      `INSERT INTO shared_project_access_logs (shared_project_id, user_id, ip_address, user_agent, action)
       VALUES ($1, $2, $3, $4, $5)`,
      [sharedProjectId, userId, ipAddress, userAgent, action]
    );
  }
}
