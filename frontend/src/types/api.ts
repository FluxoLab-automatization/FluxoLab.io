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
  activeWorkflows: number;
  activeUsers: number;
  eventsInPeriod: number;
  usagePeriodLabel: string | null;
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
  workspaceId?: string;
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
  expiresAt?: string | null;
  revokedAt?: string | null;
  metadata?: Record<string, unknown>;
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

export interface UsageAlert {
  id: string;
  metric: string;
  threshold: number;
  condition: 'greater_than' | 'less_than' | 'equals';
  window: string;
  channel: string;
  enabled: boolean;
  metadata: Record<string, unknown>;
  lastTriggeredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UsageAlertsResponse {
  status: 'ok';
  alerts: UsageAlert[];
}

export interface WorkspaceOverviewResponse {
  status: 'ok';
  overview: WorkspaceOverview;
}

// Password Reset Types
export interface ForgotPasswordPayload {
  identifier: string; // email or CPF
}

export interface VerifyResetCodePayload {
  identifier: string;
  code: string;
}

export interface ResetPasswordPayload {
  resetToken: string;
  newPassword: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyResetCodeResponse {
  resetToken: string;
}

export interface ResetPasswordResponse {
  message: string;
}

// Variables Types
export interface Variable {
  id: string;
  workspaceId: string;
  name: string;
  value: string;
  description?: string;
  isSecret: boolean;
  environment: 'development' | 'staging' | 'production';
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    email: string;
    displayName: string;
  };
}

// Tags Types
export interface Tag {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
  description?: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    email: string;
    displayName: string;
  };
}

// Engine Types
export interface WorkflowRun {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'queued' | 'running' | 'waiting_human' | 'waiting_retry' | 'succeeded' | 'failed' | 'canceled';
  triggerType: 'webhook' | 'schedule' | 'manual' | 'event';
  triggerData?: Record<string, unknown>;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  error?: {
    message: string;
    code: string;
    details?: Record<string, unknown>;
  };
  steps: WorkflowStep[];
  evidence?: {
    packageId: string;
    signedAt: string;
    hash: string;
  };
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  runId: string;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: 'pending' | 'running' | 'succeeded' | 'failed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: {
    message: string;
    code: string;
    details?: Record<string, unknown>;
  };
  retryCount: number;
  maxRetries: number;
  metadata?: Record<string, unknown>;
}

// Connectors Types
export interface Connector {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon?: string;
  version: string;
  status: 'active' | 'deprecated' | 'beta' | 'coming_soon';
  isOfficial: boolean;
  isPremium: boolean;
  tags: string[];
  documentationUrl?: string;
  supportUrl?: string;
  actions: ConnectorAction[];
  requirements: {
    authentication: 'none' | 'api_key' | 'oauth' | 'basic';
    scopes?: string[];
    webhooks?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ConnectorAction {
  id: string;
  connectorId: string;
  name: string;
  slug: string;
  description: string;
  type: 'trigger' | 'action' | 'condition';
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  isAsync: boolean;
  timeout?: number;
  retryPolicy?: {
    maxRetries: number;
    backoffStrategy: 'fixed' | 'exponential';
    baseDelay: number;
  };
  rateLimits?: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

export interface Connection {
  id: string;
  connectorId: string;
  connectorName: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'error' | 'expired';
  credentials: {
    type: 'api_key' | 'oauth' | 'basic';
    fields: Record<string, string>;
  };
  lastTestedAt?: string;
  lastUsedAt?: string;
  expiresAt?: string;
  error?: {
    message: string;
    code: string;
    occurredAt: string;
  };
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    email: string;
    displayName: string;
  };
}

// Templates Types
export interface Template {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  vertical: 'health' | 'retail' | 'marketing' | 'agro' | 'accounting' | 'hr' | 'general';
  version: string;
  status: 'active' | 'deprecated' | 'beta' | 'coming_soon';
  isOfficial: boolean;
  isPremium: boolean;
  tags: string[];
  icon?: string;
  previewImage?: string;
  documentationUrl?: string;
  supportUrl?: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  parameters: TemplateParameter[];
  workflow: {
    nodes: Array<{
      id: string;
      type: string;
      name: string;
      position: { x: number; y: number };
      data: Record<string, unknown>;
    }>;
    connections: Array<{
      id: string;
      source: string;
      target: string;
      sourceHandle?: string;
      targetHandle?: string;
    }>;
  };
  requirements: {
    connectors: string[];
    variables: string[];
    permissions: string[];
  };
  metrics: {
    installCount: number;
    rating: number;
    reviewCount: number;
    successRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TemplateParameter {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'json';
  label: string;
  description: string;
  required: boolean;
  defaultValue?: unknown;
  options?: Array<{
    value: string;
    label: string;
  }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: string;
  };
}

// AI Chat Types
export interface AiConversation {
  id: string;
  title: string;
  context: {
    type: 'workflow' | 'general' | 'support';
    entityId?: string;
    entityName?: string;
  };
  status: 'active' | 'archived' | 'deleted';
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    email: string;
    displayName: string;
  };
}

export interface AiMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    model?: string;
    tokens?: number;
    processingTime?: number;
    suggestions?: string[];
    actions?: Array<{
      type: 'workflow_action' | 'navigate' | 'search' | 'help';
      label: string;
      data: Record<string, unknown>;
    }>;
  };
  attachments?: Array<{
    id: string;
    type: 'image' | 'file' | 'workflow' | 'variable';
    name: string;
    url?: string;
    data?: Record<string, unknown>;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Support Types
export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
  assignedTo?: {
    id: string;
    email: string;
    displayName: string;
    avatar?: string;
  };
  tags: string[];
  attachments: SupportAttachment[];
  messages: SupportMessage[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  createdBy: {
    id: string;
    email: string;
    displayName: string;
    avatar?: string;
  };
}

export interface SupportCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon?: string;
  isActive: boolean;
  ticketCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  content: string;
  type: 'user' | 'agent' | 'system';
  isInternal: boolean;
  attachments: SupportAttachment[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    email: string;
    displayName: string;
    avatar?: string;
  };
}

export interface SupportAttachment {
  id: string;
  ticketId?: string;
  messageId?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  uploadedBy: {
    id: string;
    email: string;
    displayName: string;
  };
}




