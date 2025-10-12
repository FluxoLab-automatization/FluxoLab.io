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
exports.WorkspaceIntegrationsRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../../shared/database/database.service");
let WorkspaceIntegrationsRepository = class WorkspaceIntegrationsRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get pool() {
        return this.database.getPool();
    }
    async seedPlaceholders(workspaceId) {
        await this.pool.query(`
        INSERT INTO workspace_secret_providers (workspace_id, provider, status, metadata)
        VALUES
          ($1, 'aws_secrets_manager', 'requires_upgrade', jsonb_build_object('seed', 'default')),
          ($1, 'azure_key_vault', 'requires_upgrade', jsonb_build_object('seed', 'default'))
        ON CONFLICT (workspace_id, provider) DO NOTHING
      `, [workspaceId]);
        await this.pool.query(`
        INSERT INTO workspace_log_destinations (workspace_id, destination, status, metadata)
        VALUES
          ($1, 'splunk', 'configured', jsonb_build_object('seed', 'default', 'index', 'fluxolab_prod')),
          ($1, 'datadog', 'available', jsonb_build_object('seed', 'default')),
          ($1, 's3_glacier', 'requires_upgrade', jsonb_build_object('seed', 'default'))
        ON CONFLICT (workspace_id, destination) DO NOTHING
      `, [workspaceId]);
        await this.pool.query(`
        INSERT INTO workspace_sso_configs (workspace_id, provider, status, metadata)
        VALUES
          ($1, 'okta', 'active', jsonb_build_object('seed', 'default')),
          ($1, 'azure_ad', 'review', jsonb_build_object('seed', 'default')),
          ($1, 'google_workspace', 'draft', jsonb_build_object('seed', 'default'))
        ON CONFLICT (workspace_id, provider) DO NOTHING
      `, [workspaceId]);
        await this.pool.query(`
        INSERT INTO workspace_ldap_configs (workspace_id, host, base_dn, status, metadata)
        VALUES
          ($1, 'ldap.corp.local', 'dc=corp,dc=local', 'inactive', jsonb_build_object('seed', 'default'))
        ON CONFLICT (workspace_id) DO NOTHING
      `, [workspaceId]);
        await this.pool.query(`
        INSERT INTO workspace_community_connectors (workspace_id, name, author, status, metadata)
        VALUES
          ($1, 'Webhook Inspector', 'Labs Squad', 'certified', jsonb_build_object('seed', 'default')),
          ($1, 'Banco Central PIX', 'Parceiros Fintech', 'in_review', jsonb_build_object('seed', 'default')),
          ($1, 'WhatsApp Cloud Alerts', 'FluxoLab Community', 'certified', jsonb_build_object('seed', 'default'))
        ON CONFLICT (workspace_id, name) DO NOTHING
      `, [workspaceId]);
    }
    async listSecretProviders(workspaceId) {
        const result = await this.pool.query(`
        SELECT provider,
               status,
               metadata,
               last_synced_at
          FROM workspace_secret_providers
         WHERE workspace_id = $1
         ORDER BY provider ASC
      `, [workspaceId]);
        return result.rows;
    }
    async listLogDestinations(workspaceId) {
        const result = await this.pool.query(`
        SELECT destination,
               status,
               config,
               metadata,
               last_streamed_at
          FROM workspace_log_destinations
         WHERE workspace_id = $1
         ORDER BY destination ASC
      `, [workspaceId]);
        return result.rows;
    }
    async listSsoConfigs(workspaceId) {
        const result = await this.pool.query(`
        SELECT provider,
               status,
               metadata,
               enabled_at,
               disabled_at
          FROM workspace_sso_configs
         WHERE workspace_id = $1
         ORDER BY provider ASC
      `, [workspaceId]);
        return result.rows;
    }
    async getLdapConfig(workspaceId) {
        const result = await this.pool.query(`
        SELECT status,
               host,
               base_dn,
               metadata,
               last_synced_at
          FROM workspace_ldap_configs
         WHERE workspace_id = $1
         LIMIT 1
      `, [workspaceId]);
        return result.rows[0] ?? null;
    }
    async listCommunityConnectors(workspaceId) {
        const result = await this.pool.query(`
        SELECT name,
               author,
               status,
               metadata,
               created_at
          FROM workspace_community_connectors
         WHERE workspace_id = $1
         ORDER BY created_at DESC
      `, [workspaceId]);
        return result.rows;
    }
};
exports.WorkspaceIntegrationsRepository = WorkspaceIntegrationsRepository;
exports.WorkspaceIntegrationsRepository = WorkspaceIntegrationsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], WorkspaceIntegrationsRepository);
//# sourceMappingURL=workspace-integrations.repository.js.map