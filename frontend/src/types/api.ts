export interface ApiUser {
  id: string;
  email: string;
  displayName: string;
  avatarColor: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface LoginResponse {
  status: 'ok';
  token: string;
  user: ApiUser;
}

export interface MeResponse {
  status: 'ok';
  user: ApiUser;
}

export interface AuthErrorResponse {
  status: 'error';
  message: string;
}

export interface WorkspaceMetrics {
  totalProjects: number;
  totalWebhooks: number;
  totalEvents: number;
}

export interface Project {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface Activity {
  id: string;
  entityType: string;
  entityId: string | null;
  action: string;
  payload?: Record<string, unknown>;
  createdAt: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  status: string;
  signatureValid: boolean;
  receivedAt: string;
}

export interface OnboardingBlock {
  id: string;
  title: string;
  steps: string[];
  completed: boolean;
}

export interface WorkspaceOverview {
  metrics: WorkspaceMetrics;
  projects: Project[];
  activities: Activity[];
  recentWebhooks: WebhookEvent[];
  onboarding: OnboardingBlock[];
}

export interface PlanLimits {
  planCode: string;
  name: string;
  priceAmount: number;
  currency: string;
  billingInterval: 'month' | 'year';
  trialDays: number;
  limits: {
    workspaces: number | null;
    users: number | null;
    webhook: number | null;
  };
  features: Record<string, unknown>;
  subscriptionStatus?: string;
  trialEndsAt?: string | null;
  renewsAt?: string | null;
}

export interface UsageSnapshot {
  workflowsActive: number;
  usersActive: number;
  webhookEvents: number;
  collectedAt: string;
}

export interface WorkspaceEnvironment {
  id: string;
  name: string;
  slug: string;
  type: string;
  region: string | null;
  status: string;
  lastSyncedAt: string | null;
}

export interface WorkspaceApiKey {
  id: string;
  label: string;
  keyPreview: string;
  scopes: string[];
  status: string;
  createdAt: string;
  lastUsedAt: string | null;
  createdBy: { id: string; email: string | null } | null;
}

export interface FeatureGateInfo {
  id: string;
  title: string;
  requiredPlan: string;
  status: 'available' | 'requires_upgrade' | 'configured' | 'coming_soon';
  copy: string;
}

export interface SecretProviderInfo {
  provider: string;
  status: string;
  lastSyncedAt: string | null;
}

export interface SsoProviderInfo {
  provider: string;
  status: string;
  enabledAt: string | null;
  disabledAt: string | null;
}

export interface LdapInfo {
  status: string;
  host: string | null;
  baseDn: string | null;
  lastSyncedAt: string | null;
}

export interface LogDestinationInfo {
  destination: string;
  status: string;
  lastStreamedAt: string | null;
  details: Record<string, unknown>;
}

export interface CommunityConnectorInfo {
  name: string;
  author: string | null;
  status: string;
  createdAt: string;
}

export interface SettingsSummary {
  workspaceId?: string;
  plan: PlanLimits;
  usage: UsageSnapshot;
  apiKeys: WorkspaceApiKey[];
  environments: WorkspaceEnvironment[];
  featureGates: FeatureGateInfo[];
  secretProviders: SecretProviderInfo[];
  ssoProviders: SsoProviderInfo[];
  ldap: LdapInfo | null;
  logDestinations: LogDestinationInfo[];
  communityConnectors: CommunityConnectorInfo[];
}

export interface SettingsSummaryResponse {
  status: 'ok';
  summary: SettingsSummary;
}

export interface WorkspaceOverviewResponse {
  status: 'ok';
  overview: WorkspaceOverview;
}




