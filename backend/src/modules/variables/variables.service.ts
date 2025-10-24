import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../shared/database/database.service';
import { CreateVariableDto, UpdateVariableDto, CreateWorkspaceVariableDto, UpdateWorkspaceVariableDto } from './dto/variables.dto';

@Injectable()
export class VariablesService {
  constructor(private readonly databaseService: DatabaseService) {}

  // Variáveis globais do sistema
  async createGlobalVariable(createVariableDto: CreateVariableDto, userId: string) {
    const { name, description, value, type, is_encrypted } = createVariableDto;
    
    // Verificar se já existe uma variável com o mesmo nome
    const existing = await this.databaseService.query(
      'SELECT id FROM variables WHERE name = $1',
      [name]
    );
    
    if (existing.length > 0) {
      throw new ConflictException('Já existe uma variável com este nome');
    }

    const result = await this.databaseService.query(
      `INSERT INTO variables (name, description, value, type, is_encrypted, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description, value, type, is_encrypted || false, userId]
    );

    return result[0];
  }

  async getGlobalVariables() {
    const result = await this.databaseService.query(
      `SELECT v.*, u.display_name as created_by_name
       FROM variables v
       LEFT JOIN users u ON v.created_by = u.id
       ORDER BY v.created_at DESC`
    );
    return result;
  }

  async getGlobalVariableById(id: string) {
    const result = await this.databaseService.query(
      `SELECT v.*, u.display_name as created_by_name
       FROM variables v
       LEFT JOIN users u ON v.created_by = u.id
       WHERE v.id = $1`,
      [id]
    );

    if (result.length === 0) {
      throw new NotFoundException('Variável não encontrada');
    }

    return result[0];
  }

  async updateGlobalVariable(id: string, updateVariableDto: UpdateVariableDto, userId: string) {
    const { description, value, type, is_encrypted } = updateVariableDto;
    
    const result = await this.databaseService.query(
      `UPDATE variables 
       SET description = COALESCE($1, description),
           value = COALESCE($2, value),
           type = COALESCE($3, type),
           is_encrypted = COALESCE($4, is_encrypted),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [description, value, value, type, is_encrypted, id]
    );

    if (result.length === 0) {
      throw new NotFoundException('Variável não encontrada');
    }

    return result[0];
  }

  async deleteGlobalVariable(id: string) {
    const result = await this.databaseService.query(
      'DELETE FROM variables WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.length === 0) {
      throw new NotFoundException('Variável não encontrada');
    }

    return { message: 'Variável deletada com sucesso' };
  }

  // Variáveis do workspace
  async createWorkspaceVariable(workspaceId: string, createVariableDto: CreateWorkspaceVariableDto, userId: string) {
    const { name, description, value, type, is_encrypted } = createVariableDto;
    
    // Verificar se já existe uma variável com o mesmo nome no workspace
    const existing = await this.databaseService.query(
      'SELECT id FROM workspace_variables WHERE workspace_id = $1 AND name = $2',
      [workspaceId, name]
    );
    
    if (existing.length > 0) {
      throw new ConflictException('Já existe uma variável com este nome neste workspace');
    }

    const result = await this.databaseService.query(
      `INSERT INTO workspace_variables (workspace_id, name, description, value, type, is_encrypted, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [workspaceId, name, description, value, type, is_encrypted || false, userId]
    );

    return result[0];
  }

  async getWorkspaceVariables(workspaceId: string) {
    const result = await this.databaseService.query(
      `SELECT wv.*, u.display_name as created_by_name
       FROM workspace_variables wv
       LEFT JOIN users u ON wv.created_by = u.id
       WHERE wv.workspace_id = $1
       ORDER BY wv.created_at DESC`,
      [workspaceId]
    );
    return result;
  }

  async getWorkspaceVariableById(workspaceId: string, id: string) {
    const result = await this.databaseService.query(
      `SELECT wv.*, u.display_name as created_by_name
       FROM workspace_variables wv
       LEFT JOIN users u ON wv.created_by = u.id
       WHERE wv.id = $1 AND wv.workspace_id = $2`,
      [id, workspaceId]
    );

    if (result.length === 0) {
      throw new NotFoundException('Variável não encontrada');
    }

    return result[0];
  }

  async updateWorkspaceVariable(workspaceId: string, id: string, updateVariableDto: UpdateWorkspaceVariableDto, userId: string) {
    const { description, value, type, is_encrypted } = updateVariableDto;
    
    const result = await this.databaseService.query(
      `UPDATE workspace_variables 
       SET description = COALESCE($1, description),
           value = COALESCE($2, value),
           type = COALESCE($3, type),
           is_encrypted = COALESCE($4, is_encrypted),
           updated_at = NOW()
       WHERE id = $5 AND workspace_id = $6
       RETURNING *`,
      [description, value, value, type, is_encrypted, id, workspaceId]
    );

    if (result.length === 0) {
      throw new NotFoundException('Variável não encontrada');
    }

    return result[0];
  }

  async deleteWorkspaceVariable(workspaceId: string, id: string) {
    const result = await this.databaseService.query(
      'DELETE FROM workspace_variables WHERE id = $1 AND workspace_id = $2 RETURNING *',
      [id, workspaceId]
    );

    if (result.length === 0) {
      throw new NotFoundException('Variável não encontrada');
    }

    return { message: 'Variável deletada com sucesso' };
  }

  // Buscar variável por nome (global ou workspace)
  async getVariableByName(workspaceId: string, name: string) {
    // Primeiro tenta buscar no workspace
    const workspaceVar = await this.databaseService.query(
      'SELECT * FROM workspace_variables WHERE workspace_id = $1 AND name = $2',
      [workspaceId, name]
    );

    if (workspaceVar.length > 0) {
      return { ...workspaceVar[0], scope: 'workspace' };
    }

    // Se não encontrou no workspace, busca global
    const globalVar = await this.databaseService.query(
      'SELECT * FROM variables WHERE name = $1',
      [name]
    );

    if (globalVar.length > 0) {
      return { ...globalVar[0], scope: 'global' };
    }

    return null;
  }
}
