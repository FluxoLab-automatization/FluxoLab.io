import { SettingsController } from './settings.controller';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { WorkspaceSettingsService } from './workspace-settings.service';
import type { UsageAnalyticsService } from './services/usage-analytics.service';
import type { PlanManagementService } from './services/plan-management.service';
import type { WorkspaceApiKeysService } from './services/workspace-api-keys.service';
import type { WorkspaceIntegrationsService } from './services/workspace-integrations.service';

describe('SettingsController', () => {
  const workspaceSettingsService = {
    getSummary: jest.fn(),
  } as unknown as WorkspaceSettingsService;

  const usageAnalyticsService = {
    createUsageAlert: jest.fn(),
  } as unknown as UsageAnalyticsService;

  const planManagementService = {} as unknown as PlanManagementService;

  const apiKeysService = {
    createKey: jest.fn(),
  } as unknown as WorkspaceApiKeysService;

  const integrationsService = {} as unknown as WorkspaceIntegrationsService;

  const controller = new SettingsController(
    workspaceSettingsService,
    usageAnalyticsService,
    planManagementService,
    apiKeysService,
    integrationsService,
  );

  const currentUser = {
    id: 'user-1',
    workspaceId: 'workspace-1',
  } as unknown as AuthenticatedUser;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates usage alerts using typed payload and attaches user metadata', async () => {
    (usageAnalyticsService.createUsageAlert as jest.Mock).mockResolvedValue({
      id: 'alert-123',
    });

    const payload = {
      metric: 'webhooks',
      threshold: 25,
      condition: 'greater_than',
      window: '24h',
      channel: 'email',
      enabled: true,
    } as const;

    const result = await controller.createUsageAlert(currentUser, payload);

    expect(usageAnalyticsService.createUsageAlert).toHaveBeenCalledWith(
      'workspace-1',
      expect.objectContaining({
        metric: 'webhooks',
        threshold: 25,
        condition: 'greater_than',
        window: '24h',
        channel: 'email',
        metadata: {},
        createdBy: 'user-1',
      }),
    );
    expect(result.alert).toEqual({ id: 'alert-123' });
  });

  it('creates API keys with normalized defaults', async () => {
    (apiKeysService.createKey as jest.Mock).mockResolvedValue({
      token: 'token-123',
      key: { id: 'key-123' },
    });

    const payload = {
      scopes: ['workspace:read'],
      metadata: { source: 'test' },
      expiresAt: '2030-01-01T00:00:00.000Z',
    };

    const response = await controller.createApiKey(currentUser, payload);

    expect(apiKeysService.createKey).toHaveBeenCalledWith({
      workspaceId: 'workspace-1',
      label: 'Chave API',
      scopes: ['workspace:read'],
      createdBy: 'user-1',
      expiresAt: new Date('2030-01-01T00:00:00.000Z'),
      metadata: { source: 'test' },
    });

    expect(response).toEqual({
      status: 'ok',
      token: 'token-123',
      key: { id: 'key-123' },
    });
  });
});
