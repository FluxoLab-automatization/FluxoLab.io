import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../shared/database/database.service';
import { CreateTagDto, UpdateTagDto, CreateTagCategoryDto, UpdateTagCategoryDto, AssignTagsToWorkflowDto } from './dto/tags.dto';

@Injectable()
export class TagsService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Categorias de tags
  async createTagCategory(createTagCategoryDto: CreateTagCategoryDto) {
    const { name, description, color } = createTagCategoryDto;
    
    const result = await this.databaseService.query(
      `INSERT INTO tag_categories (name, description, color)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description, color]
    );

    return result[0];
  }

  async getTagCategories() {
    const result = await this.databaseService.query(
      'SELECT * FROM tag_categories ORDER BY name'
    );
    return result;
  }

  async getTagCategoryById(id: string) {
    const result = await this.databaseService.query(
      'SELECT * FROM tag_categories WHERE id = $1',
      [id]
    );

    if (result.length === 0) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return result[0];
  }

  async updateTagCategory(id: string, updateTagCategoryDto: UpdateTagCategoryDto) {
    const { name, description, color } = updateTagCategoryDto;
    
    const result = await this.databaseService.query(
      `UPDATE tag_categories 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           color = COALESCE($3, color),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [name, description, color, id]
    );

    if (result.length === 0) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return result[0];
  }

  async deleteTagCategory(id: string) {
    const result = await this.databaseService.query(
      'DELETE FROM tag_categories WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.length === 0) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return { message: 'Categoria deletada com sucesso' };
  }

  // Tags
  async createTag(workspaceId: string, createTagDto: CreateTagDto, userId: string) {
    const { name, description, color, category_id } = createTagDto;
    
    // Verificar se já existe uma tag com o mesmo nome no workspace
    const existing = await this.databaseService.query(
      'SELECT id FROM tags WHERE workspace_id = $1 AND name = $2',
      [workspaceId, name]
    );
    
    if (existing.length > 0) {
      throw new ConflictException('Já existe uma tag com este nome neste workspace');
    }

    const result = await this.databaseService.query(
      `INSERT INTO tags (workspace_id, name, description, color, category_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [workspaceId, name, description, color, category_id, userId]
    );

    return result[0];
  }

  async getTags(workspaceId: string) {
    const result = await this.databaseService.query(
      `SELECT t.*, tc.name as category_name, tc.color as category_color, u.display_name as created_by_name
       FROM tags t
       LEFT JOIN tag_categories tc ON t.category_id = tc.id
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.workspace_id = $1
       ORDER BY t.name`,
      [workspaceId]
    );
    return result;
  }

  async getTagById(workspaceId: string, id: string) {
    const result = await this.databaseService.query(
      `SELECT t.*, tc.name as category_name, tc.color as category_color, u.display_name as created_by_name
       FROM tags t
       LEFT JOIN tag_categories tc ON t.category_id = tc.id
       LEFT JOIN users u ON t.created_by = u.id
       WHERE t.id = $1 AND t.workspace_id = $2`,
      [id, workspaceId]
    );

    if (result.length === 0) {
      throw new NotFoundException('Tag não encontrada');
    }

    return result[0];
  }

  async updateTag(workspaceId: string, id: string, updateTagDto: UpdateTagDto, userId: string) {
    const { name, description, color, category_id } = updateTagDto;
    
    // Se está mudando o nome, verificar se não existe outra tag com o mesmo nome
    if (name) {
      const existing = await this.databaseService.query(
        'SELECT id FROM tags WHERE workspace_id = $1 AND name = $2 AND id != $3',
        [workspaceId, name, id]
      );
      
      if (existing.length > 0) {
        throw new ConflictException('Já existe uma tag com este nome neste workspace');
      }
    }
    
    const result = await this.databaseService.query(
      `UPDATE tags 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           color = COALESCE($3, color),
           category_id = COALESCE($4, category_id),
           updated_at = NOW()
       WHERE id = $5 AND workspace_id = $6
       RETURNING *`,
      [name, description, color, category_id, id, workspaceId]
    );

    if (result.length === 0) {
      throw new NotFoundException('Tag não encontrada');
    }

    return result[0];
  }

  async deleteTag(workspaceId: string, id: string) {
    const result = await this.databaseService.query(
      'DELETE FROM tags WHERE id = $1 AND workspace_id = $2 RETURNING *',
      [id, workspaceId]
    );

    if (result.length === 0) {
      throw new NotFoundException('Tag não encontrada');
    }

    return { message: 'Tag deletada com sucesso' };
  }

  // Relacionamento entre workflows e tags
  async assignTagsToWorkflow(workspaceId: string, workflowId: string, assignTagsDto: AssignTagsToWorkflowDto) {
    const { tag_ids } = assignTagsDto;
    
    // Verificar se o workflow existe no workspace
    const workflow = await this.databaseService.query(
      'SELECT id FROM workflows WHERE id = $1 AND workspace_id = $2',
      [workflowId, workspaceId]
    );

    if (workflow.length === 0) {
      throw new NotFoundException('Workflow não encontrado');
    }

    // Verificar se todas as tags existem no workspace
    const tags = await this.databaseService.query(
      'SELECT id FROM tags WHERE id = ANY($1) AND workspace_id = $2',
      [tag_ids, workspaceId]
    );

    if (tags.length !== tag_ids.length) {
      throw new NotFoundException('Uma ou mais tags não foram encontradas');
    }

    // Remover tags existentes do workflow
    await this.databaseService.query(
      'DELETE FROM workflow_tags WHERE workflow_id = $1',
      [workflowId]
    );

    // Adicionar novas tags
    if (tag_ids.length > 0) {
      const values = tag_ids.map(tagId => `('${workflowId}', '${tagId}')`).join(',');
      await this.databaseService.query(
        `INSERT INTO workflow_tags (workflow_id, tag_id) VALUES ${values}`
      );
    }

    return { message: 'Tags atribuídas com sucesso' };
  }

  async getWorkflowTags(workspaceId: string, workflowId: string) {
    const result = await this.databaseService.query(
      `SELECT t.*, tc.name as category_name, tc.color as category_color
       FROM workflow_tags wt
       JOIN tags t ON wt.tag_id = t.id
       LEFT JOIN tag_categories tc ON t.category_id = tc.id
       JOIN workflows w ON wt.workflow_id = w.id
       WHERE w.id = $1 AND w.workspace_id = $2
       ORDER BY t.name`,
      [workflowId, workspaceId]
    );
    return result;
  }

  async getTagsByCategory(workspaceId: string, categoryId: string) {
    const result = await this.databaseService.query(
      `SELECT t.*, tc.name as category_name, tc.color as category_color
       FROM tags t
       LEFT JOIN tag_categories tc ON t.category_id = tc.id
       WHERE t.workspace_id = $1 AND t.category_id = $2
       ORDER BY t.name`,
      [workspaceId, categoryId]
    );
    return result;
  }
}
