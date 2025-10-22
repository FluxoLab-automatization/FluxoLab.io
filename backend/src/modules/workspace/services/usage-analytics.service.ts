import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../shared/database/database.service';
import {
  UsageHistoryQueryDto,
  UsageHistoryResponse,
  UsageDataPoint,
} from '../dto/usage-history.dto';
import {
  WorkspaceUsageAlertsRepository,
  WorkspaceUsageAlertRecord,
} from '../repositories/workspace-usage-alerts.repository';

type DateRange = { start: Date; end: Date };

type UsageAlertMetric = 'webhooks' | 'users' | 'workflows';
type UsageAlertCondition = 'greater_than' | 'less_than' | 'equals';

interface CreateUsageAlertInput {
  metric: UsageAlertMetric;
  threshold: number;
  condition: UsageAlertCondition;
  window?: string;
  channel?: string;
  enabled?: boolean;
  metadata?: Record<string, unknown>;
  createdBy: string | null;
}

@Injectable()
export class UsageAnalyticsService {
  private readonly logger = new Logger(UsageAnalyticsService.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly usageAlerts: WorkspaceUsageAlertsRepository,
  ) {}

  async getUsageHistory(
    workspaceId: string,
    query: UsageHistoryQueryDto,
  ): Promise<UsageHistoryResponse[]> {
    const { period, startDate, endDate, metric } = query;

    // Garante um período padrão quando não vier do DTO
    const dateRange = this.calculateDateRange(period ?? '30d', startDate, endDate);

    const results: UsageHistoryResponse[] = [];

    if (!metric || metric === 'webhooks' || metric === 'all') {
      results.push(await this.getWebhookUsageHistory(workspaceId, dateRange));
    }

    if (!metric || metric === 'users' || metric === 'all') {
      results.push(await this.getUserUsageHistory(workspaceId, dateRange));
    }

    if (!metric || metric === 'workflows' || metric === 'all') {
      results.push(await this.getWorkflowUsageHistory(workspaceId, dateRange));
    }

    return results;
  }

  private async getWebhookUsageHistory(
    workspaceId: string,
    dateRange: DateRange,
  ): Promise<UsageHistoryResponse> {
    const pool = this.database.getPool();

    const query = `
      SELECT 
        DATE(created_at) AS date,
        COUNT(*) AS value
      FROM webhook_events 
      WHERE workspace_id = $1 
        AND created_at >= $2 
        AND created_at <= $3
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const result = await pool.query(query, [workspaceId, dateRange.start, dateRange.end]);

    const data: UsageDataPoint[] = result.rows.map((row) => {
      // Em pg, DATE(...) costuma vir como string 'YYYY-MM-DD'
      const dateStr =
        row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date);
      return {
        date: dateStr,
        value: Number(row.value),
        label: 'Webhook Events',
      };
    });

    const previousRange = this.getPreviousPeriod(dateRange);
    const previousResult = await pool.query(query, [
      workspaceId,
      previousRange.start,
      previousRange.end,
    ]);
    const previousTotal = previousResult.rows.reduce((sum, row) => sum + Number(row.value), 0);

    return this.buildUsageResponse('webhooks', data, dateRange, previousTotal);
  }

  private async getUserUsageHistory(
    workspaceId: string,
    dateRange: DateRange,
  ): Promise<UsageHistoryResponse> {
    const pool = this.database.getPool();

    const query = `
      SELECT 
        DATE(last_active_at) AS date,
        COUNT(DISTINCT user_id) AS value
      FROM user_sessions 
      WHERE workspace_id = $1 
        AND last_active_at >= $2 
        AND last_active_at <= $3
      GROUP BY DATE(last_active_at)
      ORDER BY date ASC
    `;

    const result = await pool.query(query, [workspaceId, dateRange.start, dateRange.end]);

    const data: UsageDataPoint[] = result.rows.map((row) => {
      const dateStr =
        row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date);
      return {
        date: dateStr,
        value: Number(row.value),
        label: 'Active Users',
      };
    });

    const previousRange = this.getPreviousPeriod(dateRange);
    const previousResult = await pool.query(query, [
      workspaceId,
      previousRange.start,
      previousRange.end,
    ]);
    const previousTotal = previousResult.rows.reduce((sum, row) => sum + Number(row.value), 0);

    return this.buildUsageResponse('users', data, dateRange, previousTotal);
  }

  private async getWorkflowUsageHistory(
    workspaceId: string,
    dateRange: DateRange,
  ): Promise<UsageHistoryResponse> {
    const pool = this.database.getPool();

    const query = `
      SELECT 
        DATE(updated_at) AS date,
        COUNT(*) AS value
      FROM workflows 
      WHERE workspace_id = $1 
        AND status = 'active'
        AND updated_at >= $2 
        AND updated_at <= $3
      GROUP BY DATE(updated_at)
      ORDER BY date ASC
    `;

    const result = await pool.query(query, [workspaceId, dateRange.start, dateRange.end]);

    const data: UsageDataPoint[] = result.rows.map((row) => {
      const dateStr =
        row.date instanceof Date ? row.date.toISOString().slice(0, 10) : String(row.date);
      return {
        date: dateStr,
        value: Number(row.value),
        label: 'Active Workflows',
      };
    });

    const previousRange = this.getPreviousPeriod(dateRange);
    const previousResult = await pool.query(query, [
      workspaceId,
      previousRange.start,
      previousRange.end,
    ]);
    const previousTotal = previousResult.rows.reduce((sum, row) => sum + Number(row.value), 0);

    return this.buildUsageResponse('workflows', data, dateRange, previousTotal);
  }

  private buildUsageResponse(
    metric: string,
    data: UsageDataPoint[],
    dateRange: DateRange,
    previousTotal: number,
  ): UsageHistoryResponse {
    const total = data.reduce((sum, point) => sum + point.value, 0);
    const average = data.length > 0 ? total / data.length : 0;
    const peak = Math.max(...data.map((point) => point.value), 0);

    const growth = this.calculateGrowthRate(total, previousTotal);

    return {
      metric,
      period: `${dateRange.start.toISOString().slice(0, 10)} to ${dateRange.end
        .toISOString()
        .slice(0, 10)}`,
      data,
      summary: {
        total,
        average: Math.round(average * 100) / 100,
        peak,
        growth,
      },
    };
  }

  private calculateDateRange(
    period: string, // '7d' | '14d' | '30d' | '90d' | 'custom'
    startDate?: string,
    endDate?: string,
  ): DateRange {
    // Se datas explícitas vierem (ou period == 'custom'), respeita o range informado
    if (startDate || endDate || period === 'custom') {
      const start = startDate ? new Date(startDate) : new Date();
      const end = endDate ? new Date(endDate) : new Date();
      // incluir o dia final inteiro para funcionar com filtro <= $3
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    // Períodos relativos do tipo 'Nd'
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const match = /^(\d+)d$/.exec(period);
    const days = match ? parseInt(match[1], 10) : 30;

    const start = new Date(end);
    // janela inclusiva: hoje conta como 1 dia (ex.: '7d' = hoje + 6 dias anteriores)
    start.setDate(start.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);

    return { start, end };
  }

  private getPreviousPeriod(current: DateRange): DateRange {
    const duration = current.end.getTime() - current.start.getTime();
    return {
      start: new Date(current.start.getTime() - duration),
      end: new Date(current.start.getTime() - 1),
    };
  }

  private calculateGrowthRate(currentTotal: number, previousTotal: number): number {
    if (previousTotal === 0) {
      return currentTotal === 0 ? 0 : 100;
    }
    const diff = ((currentTotal - previousTotal) / previousTotal) * 100;
    return Math.round(diff * 100) / 100;
  }

  async getUsageAlerts(workspaceId: string): Promise<any[]> {
    const records = await this.usageAlerts.listByWorkspace(workspaceId);
    return records.map((record) => this.mapAlert(record));
  }

  async createUsageAlert(
    workspaceId: string,
    alertConfig: CreateUsageAlertInput,
  ): Promise<any> {
    const record = await this.usageAlerts.createAlert({
      workspaceId,
      metric: alertConfig.metric,
      threshold: alertConfig.threshold,
      condition: alertConfig.condition,
      window: alertConfig.window ?? '24h',
      channel: alertConfig.channel ?? 'email',
      createdBy: alertConfig.createdBy,
      metadata: alertConfig.metadata ?? {},
    });

    let finalRecord: WorkspaceUsageAlertRecord = record;
    if (alertConfig.enabled === false) {
      await this.usageAlerts.setEnabled(record.id, false);
      finalRecord = { ...record, enabled: false };
    }

    return this.mapAlert(finalRecord);
  }

  private mapAlert(record: WorkspaceUsageAlertRecord) {
    return {
      id: record.id,
      metric: record.metric,
      threshold: Number(record.threshold),
      condition: record.condition,
      window: record.window,
      channel: record.channel,
      enabled: record.enabled,
      metadata: record.metadata ?? {},
      lastTriggeredAt: record.last_triggered_at,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }
}
