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
exports.SubscriptionsRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../../shared/database/database.service");
let SubscriptionsRepository = class SubscriptionsRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get pool() {
        return this.database.getPool();
    }
    mapRow(row) {
        return {
            id: row.id,
            workspaceId: row.workspace_id,
            planId: row.plan_id,
            status: row.status,
            startedAt: row.started_at,
            trialStartsAt: row.trial_starts_at,
            trialEndsAt: row.trial_ends_at,
            renewsAt: row.renews_at,
            canceledAt: row.canceled_at,
            cancelAtPeriodEnd: row.cancel_at_period_end,
            externalReference: row.external_reference,
            metadata: row.metadata ?? {},
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
    async createInitialSubscription(params) {
        const trialDays = Math.max(0, Math.floor(params.trialDays || 0));
        const metadata = params.metadata ?? {};
        const result = await this.pool.query(`
        INSERT INTO workspace_subscriptions (
          workspace_id,
          plan_id,
          status,
          trial_starts_at,
          trial_ends_at,
          renews_at,
          metadata,
          external_reference,
          cancel_at_period_end
        )
        VALUES (
          $1,
          $2,
          CASE WHEN $3 > 0 THEN 'trialing' ELSE 'active' END,
          CASE WHEN $3 > 0 THEN NOW() ELSE NULL END,
          CASE WHEN $3 > 0 THEN NOW() + make_interval(days => $3) ELSE NULL END,
          NOW() + make_interval(days => 30),
          $4::jsonb,
          $5,
          FALSE
        )
        RETURNING id,
                  workspace_id,
                  plan_id,
                  status,
                  started_at,
                  trial_starts_at,
                  trial_ends_at,
                  renews_at,
                  canceled_at,
                  cancel_at_period_end,
                  external_reference,
                  metadata,
                  created_at,
                  updated_at
      `, [
            params.workspaceId,
            params.planId,
            trialDays,
            JSON.stringify({
                ...metadata,
                seed: 'initial_subscription',
            }),
            params.externalReference ?? null,
        ]);
        return this.mapRow(result.rows[0]);
    }
    async findActiveByWorkspace(workspaceId) {
        const result = await this.pool.query(`
        SELECT id,
               workspace_id,
               plan_id,
               status,
               started_at,
               trial_starts_at,
               trial_ends_at,
               renews_at,
               canceled_at,
               cancel_at_period_end,
               external_reference,
               metadata,
               created_at,
               updated_at
          FROM workspace_subscriptions
         WHERE workspace_id = $1
           AND status IN ('trialing', 'active', 'scheduled')
         ORDER BY created_at DESC
         LIMIT 1
      `, [workspaceId]);
        const row = result.rows[0];
        return row ? this.mapRow(row) : null;
    }
};
exports.SubscriptionsRepository = SubscriptionsRepository;
exports.SubscriptionsRepository = SubscriptionsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], SubscriptionsRepository);
//# sourceMappingURL=subscriptions.repository.js.map