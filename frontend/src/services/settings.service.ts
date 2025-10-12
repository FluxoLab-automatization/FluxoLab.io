import { apiFetch } from './api';
import type { SettingsSummaryResponse, SettingsSummary } from '../types/api';

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
export async function fetchUsageHistory(params: {
  period?: string;
  startDate?: string;
  endDate?: string;
  metric?: 'webhooks' | 'users' | 'workflows' | 'all';
}) {
  const searchParams = new URLSearchParams();
  if (params.period) searchParams.set('period', params.period);
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);
  if (params.metric) searchParams.set('metric', params.metric);

  return apiFetch(`/settings/usage/history?${searchParams.toString()}`, {
    method: 'GET',
  });
}

export async function fetchUsageAlerts() {
  return apiFetch('/settings/usage/alerts', {
    method: 'GET',
  });
}

export async function createUsageAlert(alertConfig: {
  metric: string;
  threshold: number;
  condition: 'greater_than' | 'less_than' | 'equals';
  enabled: boolean;
}) {
  return apiFetch('/settings/usage/alerts', {
    method: 'POST',
    body: alertConfig,
  });
}

// Plan Management
export async function fetchAvailablePlans() {
  return apiFetch('/settings/plans/available', {
    method: 'GET',
  });
}

export async function upgradePlan(upgradeData: {
  planCode: string;
  billingInterval?: 'month' | 'year';
  immediate?: boolean;
}) {
  return apiFetch('/settings/plans/upgrade', {
    method: 'POST',
    body: upgradeData,
  });
}

export async function cancelSubscription(cancelData: {
  reason?: string;
  immediate?: boolean;
}) {
  return apiFetch('/settings/billing/cancel', {
    method: 'POST',
    body: cancelData,
  });
}

export async function fetchBillingHistory() {
  return apiFetch('/settings/billing/history', {
    method: 'GET',
  });
}

// Personal Settings
export async function updateProfile(profileData: {
  displayName?: string;
  email?: string;
  avatar?: string;
  timezone?: string;
  language?: string;
}) {
  return apiFetch('/settings/personal/profile', {
    method: 'PUT',
    body: profileData,
  });
}

export async function updateSecuritySettings(securityData: {
  password?: string;
  twoFactorEnabled?: boolean;
  sessionTimeout?: number;
}) {
  return apiFetch('/settings/personal/security', {
    method: 'PUT',
    body: securityData,
  });
}

export async function fetchPersonalPreferences() {
  return apiFetch('/settings/personal/preferences', {
    method: 'GET',
  });
}

export async function updatePersonalPreferences(preferences: {
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  privacy?: {
    profileVisibility?: 'public' | 'private' | 'workspace';
    showOnlineStatus?: boolean;
  };
}) {
  return apiFetch('/settings/personal/preferences', {
    method: 'PUT',
    body: preferences,
  });
}

// API Management
export async function createApiKey(keyData: {
  label: string;
  description?: string;
  scopes: string[];
  expiresAt?: string;
}) {
  return apiFetch('/settings/api/keys', {
    method: 'POST',
    body: keyData,
  });
}

export async function revokeApiKey(keyId: string) {
  return apiFetch(`/settings/api/keys/${keyId}`, {
    method: 'DELETE',
  });
}

export async function fetchApiKeyUsage(keyId: string, params?: {
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);
  if (params?.limit) searchParams.set('limit', params.limit.toString());

  return apiFetch(`/settings/api/keys/${keyId}/usage?${searchParams.toString()}`, {
    method: 'GET',
  });
}

export async function rotateApiKey(keyId: string) {
  return apiFetch(`/settings/api/keys/${keyId}/rotate`, {
    method: 'PUT',
  });
}

// Integration Settings
export async function fetchIntegrationStatus() {
  return apiFetch('/settings/integrations/status', {
    method: 'GET',
  });
}

export async function updateEnvironmentStatus(environmentId: string, status: 'active' | 'inactive') {
  return apiFetch(`/settings/environments/${environmentId}/status`, {
    method: 'PUT',
    body: { status },
  });
}

export async function configureSSO(ssoData: {
  provider: 'google' | 'microsoft' | 'okta' | 'auth0';
  clientId: string;
  clientSecret: string;
  enabled: boolean;
}) {
  return apiFetch('/settings/sso/configure', {
    method: 'POST',
    body: ssoData,
  });
}

export async function configureLDAP(ldapData: {
  host: string;
  port: number;
  baseDn: string;
  bindDn: string;
  bindPassword: string;
  enabled: boolean;
}) {
  return apiFetch('/settings/ldap/configure', {
    method: 'POST',
    body: ldapData,
  });
}

export async function configureLogDestination(destinationData: {
  destination: 'elasticsearch' | 'splunk' | 'datadog' | 'custom';
  endpoint: string;
  apiKey?: string;
  enabled: boolean;
}) {
  return apiFetch('/settings/logs/configure', {
    method: 'POST',
    body: destinationData,
  });
}

// Feature Gates
export async function fetchFeatureGates() {
  return apiFetch('/settings/features/gates', {
    method: 'GET',
  });
}

export async function requestFeatureAccess(featureId: string, reason?: string) {
  return apiFetch('/settings/features/request-access', {
    method: 'POST',
    body: { featureId, reason },
  });
}
