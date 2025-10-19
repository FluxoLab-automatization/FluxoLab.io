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
exports.WorkspaceApiKeysService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const security_service_1 = require("../../../shared/security/security.service");
const workspace_api_keys_repository_1 = require("../repositories/workspace-api-keys.repository");
const workspace_api_key_audit_repository_1 = require("../repositories/workspace-api-key-audit.repository");
const workspace_integration_events_repository_1 = require("../repositories/workspace-integration-events.repository");
let WorkspaceApiKeysService = class WorkspaceApiKeysService {
    apiKeysRepository;
    auditRepository;
    integrationEvents;
    securityService;
    constructor(apiKeysRepository, auditRepository, integrationEvents, securityService) {
        this.apiKeysRepository = apiKeysRepository;
        this.auditRepository = auditRepository;
        this.integrationEvents = integrationEvents;
        this.securityService = securityService;
    }
    async listKeys(workspaceId) {
        const records = await this.apiKeysRepository.listActive(workspaceId);
        return records.map((record) => this.mapRecord(record));
    }
    async createKey(params) {
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
    async revokeKey(params) {
        await this.apiKeysRepository.revokeKey(params.workspaceId, params.apiKeyId);
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
    async rotateKey(params) {
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
    async getKeyUsage(workspaceId, apiKeyId, limit = 50) {
        return this.auditRepository.listRecent(workspaceId, apiKeyId, limit);
    }
    generateToken() {
        return `flx_${(0, crypto_1.randomBytes)(24).toString('hex')}`;
    }
    buildPreview(token) {
        const clean = token.replace(/\s+/g, '');
        return `${clean.slice(0, 4)}...${clean.slice(-4)}`;
    }
    mapRecord(record) {
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
};
exports.WorkspaceApiKeysService = WorkspaceApiKeysService;
exports.WorkspaceApiKeysService = WorkspaceApiKeysService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [workspace_api_keys_repository_1.WorkspaceApiKeysRepository,
        workspace_api_key_audit_repository_1.WorkspaceApiKeyAuditRepository,
        workspace_integration_events_repository_1.WorkspaceIntegrationEventsRepository,
        security_service_1.SecurityService])
], WorkspaceApiKeysService);
//# sourceMappingURL=workspace-api-keys.service.js.map