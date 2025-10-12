import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../shared/database/database.service';
import {
  UpgradePlanDto,
  CancelSubscriptionDto,
  AvailablePlan,
  PlanUpgradeResponse,
} from '../dto/plan-management.dto';

@Injectable()
export class PlanManagementService {
  private readonly logger = new Logger(PlanManagementService.name);

  constructor(private readonly database: DatabaseService) {}

  async getAvailablePlans(): Promise<AvailablePlan[]> {
    const pool = this.database.getPool();

    const query = `
      SELECT 
        code,
        name,
        description,
        price_amount,
        currency,
        billing_interval,
        features,
        limits_workspaces,
        limits_users,
        limits_webhook,
        popular
      FROM plans 
      WHERE active = true
      ORDER BY price_amount ASC
    `;

    const result = await pool.query(query);

    return result.rows.map((row) => ({
      code: row.code,
      name: row.name,
      description: row.description,
      priceAmount: row.price_amount,
      currency: row.currency,
      billingInterval: row.billing_interval, // ok ler snake_case do DB
      features: row.features || [],
      limits: {
        workspaces: row.limits_workspaces,
        users: row.limits_users,
        webhook: row.limits_webhook,
      },
      popular: row.popular || false,
    }));
  }

  async upgradePlan(
    workspaceId: string,
    upgradeData: UpgradePlanDto,
  ): Promise<PlanUpgradeResponse> {
    const pool = this.database.getPool();

    try {
      await pool.query('BEGIN');

      // Get current subscription
      const currentSubQuery = `
        SELECT s.*, p.code as current_plan_code, p.price_amount as current_price
        FROM subscriptions s
        JOIN plans p ON s.plan_id = p.id
        WHERE s.workspace_id = $1 AND s.status = 'active'
      `;

      const currentSubResult = await pool.query(currentSubQuery, [workspaceId]);

      if (currentSubResult.rows.length === 0) {
        throw new BadRequestException('No active subscription found');
      }

      const currentSub = currentSubResult.rows[0];

      // Get new plan
      const newPlanQuery = `
        SELECT * FROM plans 
        WHERE code = $1 AND active = true
      `;

      const newPlanResult = await pool.query(newPlanQuery, [upgradeData.planCode]);

      if (newPlanResult.rows.length === 0) {
        throw new BadRequestException('Plan not found or inactive');
      }

      const newPlan = newPlanResult.rows[0];

      // Calculate prorated amount
      const proratedAmount = this.calculateProratedAmount(
        currentSub.current_price,
        newPlan.price_amount,
        currentSub.current_period_end,
        upgradeData.billingInterval ?? 'month',
      );

      // Update subscription
      const updateQuery = `
        UPDATE subscriptions 
        SET 
          plan_id = $1,
          status = $2,
          updated_at = NOW()
        WHERE workspace_id = $3 AND status = 'active'
        RETURNING *
      `;

      await pool.query(updateQuery, [
        newPlan.id,
        upgradeData.immediate ? 'active' : 'pending',
        workspaceId,
      ]);

      // Create billing record
      const billingQuery = `
        INSERT INTO billing_records (
          workspace_id,
          subscription_id,
          amount,
          currency,
          type,
          description,
          status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      await pool.query(billingQuery, [
        workspaceId,
        currentSub.id,
        proratedAmount,
        newPlan.currency,
        'upgrade',
        `Upgrade to ${newPlan.name}`,
        'pending',
      ]);

      await pool.query('COMMIT');

      const availablePlan: AvailablePlan = {
        code: newPlan.code,
        name: newPlan.name,
        description: newPlan.description,
        priceAmount: newPlan.price_amount,
        currency: newPlan.currency,
        billingInterval: upgradeData.billingInterval ?? 'month',
        features: newPlan.features || [],
        limits: {
          workspaces: newPlan.limits_workspaces,
          users: newPlan.limits_users,
          webhook: newPlan.limits_webhook,
        },
      };

      return {
        success: true,
        newPlan: availablePlan,
        billingInfo: {
          nextBillingDate: currentSub.current_period_end.toISOString(),
          proratedAmount,
          currency: newPlan.currency,
        },
        message: `Successfully upgraded to ${newPlan.name}`,
      };
    } catch (error) {
      await pool.query('ROLLBACK');
      this.logger.error('Failed to upgrade plan', error);
      throw error;
    }
  }

  async cancelSubscription(
    workspaceId: string,
    cancelData: CancelSubscriptionDto,
  ): Promise<{ success: boolean; message: string }> {
    const pool = this.database.getPool();

    try {
      await pool.query('BEGIN');

      const query = `
        UPDATE subscriptions 
        SET 
          status = $1,
          cancelled_at = NOW(),
          cancellation_reason = $2,
          updated_at = NOW()
        WHERE workspace_id = $3 AND status = 'active'
        RETURNING *
      `;

      const result = await pool.query(query, [
        cancelData.immediate ? 'cancelled' : 'cancelling',
        cancelData.reason || 'User requested cancellation',
        workspaceId,
      ]);

      if (result.rows.length === 0) {
        throw new BadRequestException('No active subscription found');
      }

      await pool.query('COMMIT');

      return {
        success: true,
        message: cancelData.immediate
          ? 'Subscription cancelled immediately'
          : 'Subscription will be cancelled at the end of the current billing period',
      };
    } catch (error) {
      await pool.query('ROLLBACK');
      this.logger.error('Failed to cancel subscription', error);
      throw error;
    }
  }

  async getBillingHistory(workspaceId: string): Promise<any[]> {
    const pool = this.database.getPool();

    const query = `
      SELECT 
        br.*,
        p.name as plan_name,
        p.code as plan_code
      FROM billing_records br
      LEFT JOIN subscriptions s ON br.subscription_id = s.id
      LEFT JOIN plans p ON s.plan_id = p.id
      WHERE br.workspace_id = $1
      ORDER BY br.created_at DESC
      LIMIT 50
    `;

    const result = await pool.query(query, [workspaceId]);

    return result.rows.map((row) => ({
      id: row.id,
      amount: row.amount,
      currency: row.currency,
      type: row.type,
      description: row.description,
      status: row.status,
      planName: row.plan_name,
      planCode: row.plan_code,
      createdAt:
        row.created_at instanceof Date
          ? row.created_at.toISOString()
          : new Date(row.created_at).toISOString(),
      paidAt:
        row.paid_at ? (row.paid_at instanceof Date ? row.paid_at.toISOString() : new Date(row.paid_at).toISOString()) : null,
    }));
  }

  private calculateProratedAmount(
    currentPrice: number,
    newPrice: number,
    periodEnd: Date,
    billingInterval: string,
  ): number {
    // Simplified proration calculation
    const daysInPeriod = billingInterval === 'year' ? 365 : 30;
    const remainingDays = Math.max(
      0,
      Math.ceil((periodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    );

    const currentProrated = (currentPrice / daysInPeriod) * remainingDays;
    const newProrated = (newPrice / daysInPeriod) * remainingDays;

    return Math.max(0, newProrated - currentProrated);
  }
}
