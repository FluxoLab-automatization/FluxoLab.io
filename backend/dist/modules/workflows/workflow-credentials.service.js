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
exports.WorkflowCredentialsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const database_service_1 = require("../../shared/database/database.service");
const DEFAULT_KEY_ID = 'default';
let WorkflowCredentialsService = class WorkflowCredentialsService {
    database;
    encryptionKey;
    constructor(database, config) {
        this.database = database;
        const rawKey = config.get('APP_SECRET', { infer: true }) ??
            config.get('JWT_SECRET', { infer: true }) ??
            'fluxolab-default-key';
        this.encryptionKey = (0, crypto_1.createHash)('sha256').update(rawKey).digest();
    }
    get pool() {
        return this.database.getPool();
    }
    async createCredential(params) {
        const iv = (0, crypto_1.randomBytes)(12);
        const payload = Buffer.from(JSON.stringify(params.secret ?? {}), 'utf8');
        const cipher = (0, crypto_1.createCipheriv)('aes-256-gcm', this.encryptionKey, iv);
        const ciphertext = Buffer.concat([cipher.update(payload), cipher.final()]);
        const tag = cipher.getAuthTag();
        const stored = Buffer.concat([ciphertext, tag]);
        const result = await this.pool.query(`
        INSERT INTO credentials (
          workspace_id,
          name,
          type,
          data_encrypted,
          data_iv,
          key_id,
          created_by,
          updated_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
        RETURNING id,
                  workspace_id,
                  name,
                  type,
                  data_encrypted,
                  data_iv,
                  key_id,
                  created_at,
                  updated_at
      `, [
            params.workspaceId,
            params.name,
            params.type,
            stored,
            iv,
            DEFAULT_KEY_ID,
            params.createdBy ?? null,
        ]);
        const row = result.rows[0];
        return {
            id: row.id,
            workspaceId: row.workspace_id,
            name: row.name,
            type: row.type,
            secret: params.secret,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            createdBy: params.createdBy ?? null,
            updatedBy: params.createdBy ?? null,
        };
    }
    async getCredential(workspaceId, credentialId) {
        const result = await this.pool.query(`
        SELECT id,
               workspace_id,
               name,
               type,
               data_encrypted,
               data_iv,
               key_id,
               created_at,
               updated_at
          FROM credentials
         WHERE id = $1
           AND workspace_id = $2
           AND deleted_at IS NULL
         LIMIT 1
      `, [credentialId, workspaceId]);
        const row = result.rows[0];
        if (!row) {
            return null;
        }
        const secret = this.decryptSecret(row);
        return {
            id: row.id,
            workspaceId: row.workspace_id,
            name: row.name,
            type: row.type,
            secret,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
    async listCredentials(workspaceId) {
        const result = await this.pool.query(`
        SELECT id,
               workspace_id,
               name,
               type,
               data_encrypted,
               data_iv,
               key_id,
               created_by,
               updated_by,
               created_at,
               updated_at
          FROM credentials
         WHERE workspace_id = $1
           AND deleted_at IS NULL
         ORDER BY created_at DESC
      `, [workspaceId]);
        return result.rows.map((row) => ({
            id: row.id,
            workspaceId: row.workspace_id,
            name: row.name,
            type: row.type,
            secret: {},
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            createdBy: row.created_by ?? null,
            updatedBy: row.updated_by ?? null,
        }));
    }
    decryptSecret(row) {
        try {
            const buffer = Buffer.from(row.data_encrypted);
            const ciphertext = buffer.subarray(0, buffer.length - 16);
            const tag = buffer.subarray(buffer.length - 16);
            const decipher = (0, crypto_1.createDecipheriv)('aes-256-gcm', this.encryptionKey, row.data_iv);
            decipher.setAuthTag(tag);
            const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
            return JSON.parse(decrypted.toString('utf8'));
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({
                status: 'error',
                message: 'Failed to decrypt credential secret',
            });
        }
    }
};
exports.WorkflowCredentialsService = WorkflowCredentialsService;
exports.WorkflowCredentialsService = WorkflowCredentialsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        config_1.ConfigService])
], WorkflowCredentialsService);
//# sourceMappingURL=workflow-credentials.service.js.map