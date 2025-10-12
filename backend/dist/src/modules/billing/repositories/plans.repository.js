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
exports.PlansRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../../shared/database/database.service");
let PlansRepository = class PlansRepository {
    database;
    constructor(database) {
        this.database = database;
    }
    get pool() {
        return this.database.getPool();
    }
    normalizePlan(row) {
        return {
            id: row.id,
            code: row.code,
            name: row.name,
            description: row.description,
            priceAmount: Number(row.price_amount),
            currency: row.currency,
            billingInterval: row.billing_interval,
            trialDays: row.trial_days,
            isActive: row.is_active,
            metadata: row.metadata ?? {},
            features: row.features ?? {},
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
    async findActivePlans() {
        const result = await this.pool.query(`
        SELECT p.id,
               p.code,
               p.name,
               p.description,
               p.price_amount::text AS price_amount,
               p.currency,
               p.billing_interval,
               p.trial_days,
               p.is_active,
               p.metadata,
               p.created_at,
               p.updated_at,
               COALESCE(
                 jsonb_object_agg(f.feature_key, f.feature_value)
                   FILTER (WHERE f.feature_key IS NOT NULL),
                 '{}'::jsonb
               ) AS features
          FROM plans p
          LEFT JOIN plan_features f ON f.plan_id = p.id
         WHERE p.is_active = TRUE
         GROUP BY p.id
         ORDER BY
           CASE p.code
             WHEN 'free' THEN 0
             WHEN 'basico' THEN 1
             WHEN 'intermediario' THEN 2
             WHEN 'full' THEN 3
             ELSE 99
           END,
           p.price_amount ASC
      `);
        return result.rows.map((row) => this.normalizePlan(row));
    }
    async findByCode(code) {
        const result = await this.pool.query(`
        SELECT p.id,
               p.code,
               p.name,
               p.description,
               p.price_amount::text AS price_amount,
               p.currency,
               p.billing_interval,
               p.trial_days,
               p.is_active,
               p.metadata,
               p.created_at,
               p.updated_at,
               COALESCE(
                 jsonb_object_agg(f.feature_key, f.feature_value)
                   FILTER (WHERE f.feature_key IS NOT NULL),
                 '{}'::jsonb
               ) AS features
          FROM plans p
          LEFT JOIN plan_features f ON f.plan_id = p.id
         WHERE p.code = $1
         GROUP BY p.id
         LIMIT 1
      `, [code]);
        const plan = result.rows[0];
        return plan ? this.normalizePlan(plan) : null;
    }
    async findById(id) {
        const result = await this.pool.query(`
        SELECT p.id,
               p.code,
               p.name,
               p.description,
               p.price_amount::text AS price_amount,
               p.currency,
               p.billing_interval,
               p.trial_days,
               p.is_active,
               p.metadata,
               p.created_at,
               p.updated_at,
               COALESCE(
                 jsonb_object_agg(f.feature_key, f.feature_value)
                   FILTER (WHERE f.feature_key IS NOT NULL),
                 '{}'::jsonb
               ) AS features
          FROM plans p
          LEFT JOIN plan_features f ON f.plan_id = p.id
         WHERE p.id = $1
         GROUP BY p.id
         LIMIT 1
      `, [id]);
        const plan = result.rows[0];
        return plan ? this.normalizePlan(plan) : null;
    }
};
exports.PlansRepository = PlansRepository;
exports.PlansRepository = PlansRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], PlansRepository);
//# sourceMappingURL=plans.repository.js.map