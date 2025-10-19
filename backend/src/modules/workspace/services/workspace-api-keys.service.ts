import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { SecurityService } from '../../../shared/security/security.service';
import {
  WorkspaceApiKeysRepository,
  WorkspaceApiKeyRecord,
} from '../repositories/workspace-api-keys.repository';
import { WorkspaceApiKeyAuditRepository } from '../repositories/workspace-api-key-audit.repository';
import { WorkspaceIntegrationEventsRepository } from '../repositories/workspace-integration-events.repository';

export interface ApiKeySummary {
  id: string;
  label: string;
  status: string;
  keyPreview: string;
  scopes: string[];
  createdBy: string | null;
  createdAt: Date;
  expiresAt: Date | null;
  revokedAt: Date | null;
  metadata: Record<string, unknown>;
}

@Injectable()
export class WorkspaceApiKeysService {
  constructor(
    private readonly apiKeysRepository: WorkspaceApiKeysRepository,
    private readonly auditRepository: WorkspaceApiKeyAuditRepository,
    private readonly integrationEvents: WorkspaceIntegrationEventsRepository,
    private readonly securityService: SecurityService,
  ) {}

  async listKeys(workspaceId: string): Promise<ApiKeySummary[]> {
    const records = await this.apiKeysRepository.listActive(workspaceId);
    return records.map((record) => this.mapRecord(record));
  }

  async createKey(params: {
    workspaceId: string;
    label: string;
    scopes: string[];
    createdBy?: string | null;
    expiresAt?: Date | null;
    metadata?: Record<string, unknown>;
  }): Promise<{ token: string; key: ApiKeySummary }> {
    const token = this.generateToken();
    const keyPreview = this.buildPreview(token);
    const keyHash = this.securityService.hashToken(token);

    const record = await this.apiKeysRepository.createKey({
      workspaceId: params.workspaceId,
      label: params.label,
      keyHash,
      keyPreview,
      scopes: params.scopes,
      createdBy: params.createdBy ?? null,
      metadata: params.metadata ?? {},
      expiresAt: params.expiresAt ?? null,
    });

    await this.auditRepository.recordEvent({
      apiKeyId: record.id,
      workspaceId: params.workspaceId,
      action: 'created',
      actorId: params.createdBy ?? null,
      metadata: {
        label: params.label,
      },
    });

    await this.integrationEvents.recordEvent({
      workspaceId: params.workspaceId,
      integrationType: 'api_key',
      integrationId: record.id,
      status: 'created',
      payload: {
        label: params.label,
        scopes: params.scopes,
      },
      recordedBy: params.createdBy ?? null,
    });

    return {
      token,
      key: this.mapRecord(record),
    };
  }

  async revokeKey(params: {
    workspaceId: string;
    apiKeyId: string;
    actorId?: string | null;
  }): Promise<void> {
    await this.apiKeysRepository.revokeKey(
      params.workspaceId,
      params.apiKeyId,
    );

    await this.auditRepository.recordEvent({
      apiKeyId: params.apiKeyId,
      workspaceId: params.workspaceId,
      action: 'revoked',
      actorId: params.actorId ?? null,
    });

    await this.integrationEvents.recordEvent({
      workspaceId: params.workspaceId,
      integrationType: 'api_key',
      integrationId: params.apiKeyId,
      status: 'revoked',
      recordedBy: params.actorId ?? null,
    });
  }

  async rotateKey(params: {
    workspaceId: string;
    apiKeyId: string;
    actorId?: string | null;
  }): Promise<{ token: string }> {
    const token = this.generateToken();
    const keyPreview = this.buildPreview(token);
    const keyHash = this.securityService.hashToken(token);

    await this.apiKeysRepository.updateKeySecret({
      workspaceId: params.workspaceId,
      apiKeyId: params.apiKeyId,
      keyHash,
      keyPreview,
    });

    await this.auditRepository.recordEvent({
      apiKeyId: params.apiKeyId,
      workspaceId: params.workspaceId,
      action: 'rotated',
      actorId: params.actorId ?? null,
    });

    await this.integrationEvents.recordEvent({
      workspaceId: params.workspaceId,
      integrationType: 'api_key',
      integrationId: params.apiKeyId,
      status: 'rotated',
      recordedBy: params.actorId ?? null,
    });

    return { token };
  }

  async getKeyUsage(
    workspaceId: string,
    apiKeyId: string,
    limit = 50,
  ) {
    return this.auditRepository.listRecent(workspaceId, apiKeyId, limit);
  }

  private generateToken(): string {
    return `flx_${randomBytes(24).toString('hex')}`;
  }

  private buildPreview(token: string): string {
    const clean = token.replace(/\s+/g, '');
    return `${clean.slice(0, 4)}...${clean.slice(-4)}`;
  }

  private mapRecord(record: WorkspaceApiKeyRecord): ApiKeySummary {
    return {
      id: record.id,
      label: record.label,
      status: record.status,
      keyPreview: record.key_preview,
      scopes: record.scopes,
      createdBy: record.created_by,
      createdAt: record.created_at,
      expiresAt: record.expires_at,
      revokedAt: record.revoked_at,
      metadata: record.metadata ?? {},
    };
  }
}
