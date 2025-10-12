import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../shared/database/database.service';

interface PlanRow {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price_amount: string;
  currency: string;
  billing_interval: 'month' | 'year';
  trial_days: number;
  is_active: boolean;
  metadata: Record<string, unknown> | null;
  features: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

export interface WorkspacePlan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  priceAmount: number;
  currency: string;
  billingInterval: 'month' | 'year';
  trialDays: number;
  isActive: boolean;
  metadata: Record<string, unknown>;
  features: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PlansRepository {
  constructor(private readonly database: DatabaseService) {}

  private get pool() {
    return this.database.getPool();
  }

  private normalizePlan(row: PlanRow): WorkspacePlan {
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

  async findActivePlans(): Promise<WorkspacePlan[]> {
    const result = await this.pool.query<PlanRow>(
      `
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
      `,
    );

    return result.rows.map((row) => this.normalizePlan(row));
  }

  async findByCode(code: string): Promise<WorkspacePlan | null> {
    const result = await this.pool.query<PlanRow>(
      `
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
      `,
      [code],
    );

    const plan = result.rows[0];
    return plan ? this.normalizePlan(plan) : null;
  }
}
\n  async findById(id: string): Promise<WorkspacePlan | null> {\n    const result = await this.pool.query<PlanRow>(\n      \n        SELECT p.id,\n               p.code,\n               p.name,\n               p.description,\n               p.price_amount::text AS price_amount,\n               p.currency,\n               p.billing_interval,\n               p.trial_days,\n               p.is_active,\n               p.metadata,\n               p.created_at,\n               p.updated_at,\n               COALESCE(\n                 jsonb_object_agg(f.feature_key, f.feature_value)\n                   FILTER (WHERE f.feature_key IS NOT NULL),\n                 '{}'::jsonb\n               ) AS features\n          FROM plans p\n          LEFT JOIN plan_features f ON f.plan_id = p.id\n         WHERE p.id = \n         GROUP BY p.id\n         LIMIT 1\n      ,\n      [id],\n    );\n\n    const plan = result.rows[0];\n    return plan ? this.normalizePlan(plan) : null;\n  }\n
