import type { Pool } from 'pg';
import { PlanManagementService } from './plan-management.service';
import type { DatabaseService } from '../../../shared/database/database.service';

describe('PlanManagementService', () => {
  const query = jest.fn();
  const pool = { query } as unknown as Pool;
  const databaseService = {
    getPool: () => pool,
  } as unknown as DatabaseService;

  const service = new PlanManagementService(databaseService);

  beforeEach(() => {
    query.mockReset();
  });

  it('normalizes available plans and parses limits/features', async () => {
    query.mockResolvedValue({
      rows: [
        {
          code: 'pro',
          name: 'Pro',
          description: 'Full access',
          price_amount: '19900',
          currency: 'BRL',
          billing_interval: 'month',
          features: '["workflow_editor","priority_support"]',
          limits_workspaces: '3',
          limits_users: 25,
          limits_webhook: null,
          popular: 1,
        },
      ],
    });

    const plans = await service.getAvailablePlans();

    expect(plans).toHaveLength(1);
    expect(plans[0]).toEqual({
      code: 'pro',
      name: 'Pro',
      description: 'Full access',
      priceAmount: 19900,
      currency: 'BRL',
      billingInterval: 'month',
      features: ['workflow_editor', 'priority_support'],
      limits: {
        workspaces: 3,
        users: 25,
        webhook: null,
      },
      popular: true,
    });
  });
});
