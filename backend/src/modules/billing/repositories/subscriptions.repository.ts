import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../shared/database/database.service';

export interface WorkspaceSubscription {
  id: string;
  workspaceId: string;
  planId: string;
  status:
    | 'trialing'
    | 'active'
    | 'past_due'
    | 'canceled'
    | 'expired'
    | 'scheduled';
  startedAt: Date;
  trialStartsAt: Date | null;
  trialEndsAt: Date | null;
  renewsAt: Date | null;
  canceledAt: Date | null;
  cancelAtPeriodEnd: boolean;
  externalReference: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

interface SubscriptionRow {
  id: string;
  workspace_id: string;
  plan_id: string;
  status: WorkspaceSubscription['status'];
  started_at: Date;
  trial_starts_at: Date | null;
  trial_ends_at: Date | null;
  renews_at: Date | null;
  canceled_at: Date | null;
  cancel_at_period_end: boolean;
  external_reference: string | null;
  metadata: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class SubscriptionsRepository {
  constructor(private readonly database: DatabaseService) {}

  private get pool() {
    return this.database.getPool();
  }

  private mapRow(row: SubscriptionRow): WorkspaceSubscription {
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

  async createInitialSubscription(params: {
    workspaceId: string;
    planId: string;
    trialDays: number;
    externalReference?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<WorkspaceSubscription> {
    const trialDays = Math.max(0, Math.floor(params.trialDays || 0));
    const metadata = params.metadata ?? {};

    const result = await this.pool.query<SubscriptionRow>(
      `
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
      `,
      [
        params.workspaceId,
        params.planId,
        trialDays,
        JSON.stringify({
          ...metadata,
          seed: 'initial_subscription',
        }),
        params.externalReference ?? null,
      ],
    );

    return this.mapRow(result.rows[0]);
  }

  async findActiveByWorkspace(
    workspaceId: string,
  ): Promise<WorkspaceSubscription | null> {
    const result = await this.pool.query<SubscriptionRow>(
      `
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
      `,
      [workspaceId],
    );

    const row = result.rows[0];
    return row ? this.mapRow(row) : null;
  }
}
