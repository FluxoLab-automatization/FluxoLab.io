import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, createCipheriv, createDecipheriv, createHash } from 'crypto';
import { DatabaseService } from '../../shared/database/database.service';
import { AppConfig } from '../../config/env.validation';

interface CreateCredentialParams {
  workspaceId: string;
  name: string;
  type: string;
  secret: Record<string, unknown>;
  createdBy?: string | null;
}

interface EncryptedRow {
  id: string;
  workspace_id: string;
  name: string;
  type: string;
  data_encrypted: Buffer;
  data_iv: Buffer;
  key_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface WorkflowCredential {
  id: string;
  workspaceId: string;
  name: string;
  type: string;
  secret: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
}

const DEFAULT_KEY_ID = 'default';

@Injectable()
export class WorkflowCredentialsService {
  private readonly encryptionKey: Buffer;

  constructor(
    private readonly database: DatabaseService,
    config: ConfigService<AppConfig, true>,
  ) {
    const rawKey =
      config.get('APP_SECRET', { infer: true }) ??
      config.get('JWT_SECRET', { infer: true }) ??
      'fluxolab-default-key';
    this.encryptionKey = createHash('sha256').update(rawKey).digest();
  }

  private get pool() {
    return this.database.getPool();
  }

  async createCredential(params: CreateCredentialParams): Promise<WorkflowCredential> {
    const iv = randomBytes(12);
    const payload = Buffer.from(JSON.stringify(params.secret ?? {}), 'utf8');
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    const ciphertext = Buffer.concat([cipher.update(payload), cipher.final()]);
    const tag = cipher.getAuthTag();
    const stored = Buffer.concat([ciphertext, tag]);

    const result = await this.pool.query<EncryptedRow>(
      `
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
      `,
      [
        params.workspaceId,
        params.name,
        params.type,
        stored,
        iv,
        DEFAULT_KEY_ID,
        params.createdBy ?? null,
      ],
    );

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

  async getCredential(workspaceId: string, credentialId: string): Promise<WorkflowCredential | null> {
    const result = await this.pool.query<EncryptedRow>(
      `
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
      `,
      [credentialId, workspaceId],
    );

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

  async listCredentials(workspaceId: string): Promise<WorkflowCredential[]> {
    const result = await this.pool.query<EncryptedRow & { created_by: string | null; updated_by: string | null }>(
      `
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
      `,
      [workspaceId],
    );

    return result.rows.map((row) => ({
      id: row.id,
      workspaceId: row.workspace_id,
      name: row.name,
      type: row.type,
      secret: {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      createdBy: (row as any).created_by ?? null,
      updatedBy: (row as any).updated_by ?? null,
    }));
  }

  private decryptSecret(row: EncryptedRow): Record<string, unknown> {
    try {
      const buffer = Buffer.from(row.data_encrypted);
      const ciphertext = buffer.subarray(0, buffer.length - 16);
      const tag = buffer.subarray(buffer.length - 16);
      const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey, row.data_iv);
      decipher.setAuthTag(tag);
      const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      return JSON.parse(decrypted.toString('utf8')) as Record<string, unknown>;
    } catch (error) {
      throw new InternalServerErrorException({
        status: 'error',
        message: 'Failed to decrypt credential secret',
      });
    }
  }
}
