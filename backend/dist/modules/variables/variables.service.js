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
exports.VariablesService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../shared/database/database.service");
let VariablesService = class VariablesService {
    databaseService;
    constructor(databaseService) {
        this.databaseService = databaseService;
    }
    async createGlobalVariable(createVariableDto, userId) {
        const { name, description, value, type, is_encrypted } = createVariableDto;
        const existing = await this.databaseService.query('SELECT id FROM variables WHERE name = $1', [name]);
        if (existing.length > 0) {
            throw new common_1.ConflictException('Já existe uma variável com este nome');
        }
        const result = await this.databaseService.query(`INSERT INTO variables (name, description, value, type, is_encrypted, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [name, description, value, type, is_encrypted || false, userId]);
        return result[0];
    }
    async getGlobalVariables() {
        const result = await this.databaseService.query(`SELECT v.*, u.display_name as created_by_name
       FROM variables v
       LEFT JOIN users u ON v.created_by = u.id
       ORDER BY v.created_at DESC`);
        return result;
    }
    async getGlobalVariableById(id) {
        const result = await this.databaseService.query(`SELECT v.*, u.display_name as created_by_name
       FROM variables v
       LEFT JOIN users u ON v.created_by = u.id
       WHERE v.id = $1`, [id]);
        if (result.length === 0) {
            throw new common_1.NotFoundException('Variável não encontrada');
        }
        return result[0];
    }
    async updateGlobalVariable(id, updateVariableDto, userId) {
        const { description, value, type, is_encrypted } = updateVariableDto;
        const result = await this.databaseService.query(`UPDATE variables 
       SET description = COALESCE($1, description),
           value = COALESCE($2, value),
           type = COALESCE($3, type),
           is_encrypted = COALESCE($4, is_encrypted),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`, [description, value, value, type, is_encrypted, id]);
        if (result.length === 0) {
            throw new common_1.NotFoundException('Variável não encontrada');
        }
        return result[0];
    }
    async deleteGlobalVariable(id) {
        const result = await this.databaseService.query('DELETE FROM variables WHERE id = $1 RETURNING *', [id]);
        if (result.length === 0) {
            throw new common_1.NotFoundException('Variável não encontrada');
        }
        return { message: 'Variável deletada com sucesso' };
    }
    async createWorkspaceVariable(workspaceId, createVariableDto, userId) {
        const { name, description, value, type, is_encrypted } = createVariableDto;
        const existing = await this.databaseService.query('SELECT id FROM workspace_variables WHERE workspace_id = $1 AND name = $2', [workspaceId, name]);
        if (existing.length > 0) {
            throw new common_1.ConflictException('Já existe uma variável com este nome neste workspace');
        }
        const result = await this.databaseService.query(`INSERT INTO workspace_variables (workspace_id, name, description, value, type, is_encrypted, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`, [workspaceId, name, description, value, type, is_encrypted || false, userId]);
        return result[0];
    }
    async getWorkspaceVariables(workspaceId) {
        const result = await this.databaseService.query(`SELECT wv.*, u.display_name as created_by_name
       FROM workspace_variables wv
       LEFT JOIN users u ON wv.created_by = u.id
       WHERE wv.workspace_id = $1
       ORDER BY wv.created_at DESC`, [workspaceId]);
        return result;
    }
    async getWorkspaceVariableById(workspaceId, id) {
        const result = await this.databaseService.query(`SELECT wv.*, u.display_name as created_by_name
       FROM workspace_variables wv
       LEFT JOIN users u ON wv.created_by = u.id
       WHERE wv.id = $1 AND wv.workspace_id = $2`, [id, workspaceId]);
        if (result.length === 0) {
            throw new common_1.NotFoundException('Variável não encontrada');
        }
        return result[0];
    }
    async updateWorkspaceVariable(workspaceId, id, updateVariableDto, userId) {
        const { description, value, type, is_encrypted } = updateVariableDto;
        const result = await this.databaseService.query(`UPDATE workspace_variables 
       SET description = COALESCE($1, description),
           value = COALESCE($2, value),
           type = COALESCE($3, type),
           is_encrypted = COALESCE($4, is_encrypted),
           updated_at = NOW()
       WHERE id = $5 AND workspace_id = $6
       RETURNING *`, [description, value, value, type, is_encrypted, id, workspaceId]);
        if (result.length === 0) {
            throw new common_1.NotFoundException('Variável não encontrada');
        }
        return result[0];
    }
    async deleteWorkspaceVariable(workspaceId, id) {
        const result = await this.databaseService.query('DELETE FROM workspace_variables WHERE id = $1 AND workspace_id = $2 RETURNING *', [id, workspaceId]);
        if (result.length === 0) {
            throw new common_1.NotFoundException('Variável não encontrada');
        }
        return { message: 'Variável deletada com sucesso' };
    }
    async getVariableByName(workspaceId, name) {
        const workspaceVar = await this.databaseService.query('SELECT * FROM workspace_variables WHERE workspace_id = $1 AND name = $2', [workspaceId, name]);
        if (workspaceVar.length > 0) {
            return { ...workspaceVar[0], scope: 'workspace' };
        }
        const globalVar = await this.databaseService.query('SELECT * FROM variables WHERE name = $1', [name]);
        if (globalVar.length > 0) {
            return { ...globalVar[0], scope: 'global' };
        }
        return null;
    }
};
exports.VariablesService = VariablesService;
exports.VariablesService = VariablesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], VariablesService);
//# sourceMappingURL=variables.service.js.map