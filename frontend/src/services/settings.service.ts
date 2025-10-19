import { apiFetch } from './api';
import type {
  SettingsSummaryResponse,
  SettingsSummary,
  UsageAlertsResponse,
  WorkspaceApiKey,
} from '../types/api';

export async function fetchSettingsSummary(
  token: string,
): Promise<SettingsSummary> {
  const { summary } = await apiFetch<SettingsSummaryResponse>(
    '/settings/summary',
    {
      method: 'GET',
      token,
    },
  );

  return summary;
}

// Usage Analytics
export async function fetchUsageHistory(
  token: string,
  params: {
  period?: string;
  startDate?: string;
  endDate?: string;
  metric?: 'webhooks' | 'users' | 'workflows' | 'all';
},
) {
  const searchParams = new URLSearchParams();
  if (params.period) searchParams.set('period', params.period);
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);
  if (params.metric) searchParams.set('metric', params.metric);

  return apiFetch(`/settings/usage/history?${searchParams.toString()}`, {
    method: 'GET',
    token,
  });
}

export async function fetchUsageAlerts(token: string) {
  return apiFetch<UsageAlertsResponse>('/settings/usage/alerts', {
    method: 'GET',
    token,
  });
}

export async function createUsageAlert(
  token: string,
  alertConfig: {
  metric: string;
  threshold: number;
  condition: 'greater_than' | 'less_than' | 'equals';
  enabled: boolean;
},
) {
  return apiFetch('/settings/usage/alerts', {
    method: 'POST',
    token,
    body: JSON.stringify(alertConfig),
  });
}

// Plan Management
export async function fetchAvailablePlans(token: string) {
  return apiFetch('/settings/plans/available', {
    method: 'GET',
    token,
  });
}

export async function upgradePlan(
  token: string,
  upgradeData: {
  planCode: string;
  billingInterval?: 'month' | 'year';
  immediate?: boolean;
},
) {
  return apiFetch('/settings/plans/upgrade', {
    method: 'POST',
    token,
    body: JSON.stringify(upgradeData),
  });
}

export async function cancelSubscription(
  token: string,
  cancelData: {
  reason?: string;
  immediate?: boolean;
},
) {
  return apiFetch('/settings/billing/cancel', {
    method: 'POST',
    token,
    body: JSON.stringify(cancelData),
  });
}

export async function fetchBillingHistory(token: string) {
  return apiFetch('/settings/billing/history', {
    method: 'GET',
    token,
  });
}

// Personal Settings
export async function updateProfile(
  token: string,
  profileData: {
  displayName?: string;
  email?: string;
  avatar?: string;
  timezone?: string;
  language?: string;
},
) {
  return apiFetch('/settings/personal/profile', {
    method: 'PUT',
    token,
    body: JSON.stringify(profileData),
  });
}

export async function updateSecuritySettings(
  token: string,
  securityData: {
  password?: string;
  twoFactorEnabled?: boolean;
  sessionTimeout?: number;
},
) {
  return apiFetch('/settings/personal/security', {
    method: 'PUT',
    token,
    body: JSON.stringify(securityData),
  });
}

export async function fetchPersonalPreferences(token: string) {
  return apiFetch('/settings/personal/preferences', {
    method: 'GET',
    token,
  });
}

export async function updatePersonalPreferences(
  token: string,
  preferences: {
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  privacy?: {
    profileVisibility?: 'public' | 'private' | 'workspace';
    showOnlineStatus?: boolean;
  };
},
) {
  return apiFetch('/settings/personal/preferences', {
    method: 'PUT',
    token,
    body: JSON.stringify(preferences),
  });
}

// API Management
export async function createApiKey(
  token: string,
  keyData: {
  label: string;
  description?: string;
  scopes: string[];
  expiresAt?: string;
  metadata?: Record<string, unknown>;
},
) {
  return apiFetch<{ token: string; key: WorkspaceApiKey }>('/settings/api/keys', {
    method: 'POST',
    token,
    body: JSON.stringify(keyData),
  });
}

export async function revokeApiKey(token: string, keyId: string) {
  return apiFetch<{ status: string }>(`/settings/api/keys/${keyId}`, {
    method: 'DELETE',
    token,
  });
}

export async function fetchApiKeyUsage(
  token: string,
  keyId: string,
  params?: {
  startDate?: string;
  endDate?: string;
  limit?: number;
},
) {
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  return apiFetch(`/settings/api/keys/${keyId}/usage?${searchParams.toString()}`, {
    method: 'GET',
    token,
  });
}

export async function rotateApiKey(token: string, keyId: string) {
  return apiFetch<{ token?: string }>(`/settings/api/keys/${keyId}/rotate`, {
    method: 'PUT',
    token,
  });
}

// Integration Settings
export async function fetchIntegrationStatus(token: string) {
  return apiFetch('/settings/integrations/status', {
    method: 'GET',
    token,
  });
}

export async function updateEnvironmentStatus(
  token: string,
  environmentId: string,
  status: 'active' | 'inactive',
) {
  return apiFetch(`/settings/environments/${environmentId}/status`, {
    method: 'PUT',
    token,
    body: JSON.stringify({ status }),
  });
}

export async function configureSSO(
  token: string,
  ssoData: {
  provider: 'google' | 'microsoft' | 'okta' | 'auth0';
  clientId: string;
  clientSecret: string;
  enabled: boolean;
},
) {
  return apiFetch('/settings/sso/configure', {
    method: 'POST',
    token,
    body: JSON.stringify(ssoData),
  });
}

export async function configureLDAP(
  token: string,
  ldapData: {
  host: string;
  port: number;
  baseDn: string;
  bindDn: string;
  bindPassword: string;
  enabled: boolean;
},
) {
  return apiFetch('/settings/ldap/configure', {
    method: 'POST',
    token,
    body: JSON.stringify(ldapData),
  });
}

export async function configureLogDestination(
  token: string,
  destinationData: {
  destination: 'elasticsearch' | 'splunk' | 'datadog' | 'custom';
  endpoint: string;
  apiKey?: string;
  enabled: boolean;
},
) {
  return apiFetch('/settings/logs/configure', {
    method: 'POST',
    token,
    body: JSON.stringify(destinationData),
  });
}

// Feature Gates
export async function fetchFeatureGates(token: string) {
  return apiFetch('/settings/features/gates', {
    method: 'GET',
    token,
  });
}

export async function requestFeatureAccess(
  token: string,
  featureId: string,
  reason?: string,
) {
  return apiFetch('/settings/features/request-access', {
    method: 'POST',
    token,
    body: JSON.stringify({ featureId, reason }),
  });
}
