import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import {
  ConversationsRepository,
  type ConversationRecord,
} from './repositories/conversations.repository';
import { ActivitiesRepository } from './repositories/activities.repository';
import { WorkspaceWebhookRepository } from './repositories/webhook-events.repository';
import { WorkspaceUsageRepository } from './repositories/workspace-usage.repository';
import { CreateProjectDto } from './dto/create-project.dto';

export interface PresentedProject {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, unknown>;
}

export interface PresentedActivity {
  id: string;
  workspaceId: string;
  entityType: string;
  entityId: string | null;
  action: string;
  payload: Record<string, unknown>;
  createdAt: Date;
}

export interface PresentedWebhookEvent {
  id: string;
  type: string | null;
  status: string;
  signatureValid: boolean;
  receivedAt: Date;
}

export interface OnboardingBlock {
  id: string;
  title: string;
  steps: string[];
  completed: boolean;
}

export interface WorkspaceOverviewResponse {
  metrics: {
    totalProjects: number;
    totalWebhooks: number;
    totalEvents: number;
    activeWorkflows: number;
    activeUsers: number;
    eventsInPeriod: number;
    usagePeriodLabel: string | null;
  };
  projects: PresentedProject[];
  activities: PresentedActivity[];
  recentWebhooks: PresentedWebhookEvent[];
  onboarding: OnboardingBlock[];
}

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly conversationsRepository: ConversationsRepository,
    private readonly activitiesRepository: ActivitiesRepository,
    private readonly webhookRepository: WorkspaceWebhookRepository,
    private readonly usageRepository: WorkspaceUsageRepository,
  ) {}

  async getOverview(
    user: AuthenticatedUser,
  ): Promise<WorkspaceOverviewResponse> {
    const workspaceId = user.workspaceId as string;
    const [
      conversations,
      activities,
      totalProjects,
      totalWebhooks,
      totalEvents,
      recentEvents,
      usageSnapshot,
    ] = await Promise.all([
      this.conversationsRepository.listRecentByOwner(user.id, 6),
      this.activitiesRepository.listRecentByUser(workspaceId, user.id, 8),
      this.conversationsRepository.countByOwner(user.id),
      this.webhookRepository.countRegistrations(workspaceId),
      this.webhookRepository.countEvents(workspaceId),
      this.webhookRepository.listRecentEvents(workspaceId, 5),
      this.usageRepository.getLatestSnapshot(workspaceId),
    ]);

    return {
      metrics: {
        totalProjects,
        totalWebhooks,
        totalEvents,
        activeWorkflows: usageSnapshot?.workflowsActive ?? 0,
        activeUsers: usageSnapshot?.usersActive ?? 0,
        eventsInPeriod: usageSnapshot?.webhookEvents ?? 0,
        usagePeriodLabel: usageSnapshot
          ? `${usageSnapshot.periodStart} → ${usageSnapshot.periodEnd}`
          : null,
      },
      projects: this.normalizeProjects(conversations),
      activities: this.normalizeActivities(activities),
      recentWebhooks: this.normalizeWebhooks(recentEvents),
      onboarding: this.buildOnboardingBlocks(conversations.length),
    };
  }

async listProjects(
  user: AuthenticatedUser,
  limit = 12,
): Promise<PresentedProject[]> {
  const projects = await this.conversationsRepository.listRecentByOwner(
    user.id,
    limit,
  );
  return projects.map((project) => this.presentProject(project));
}

async createProject(
  user: AuthenticatedUser,
  payload: CreateProjectDto,
): Promise<PresentedProject> {
  const metadata: Record<string, unknown> = {};

  if (payload.description) {
    metadata.description = payload.description;
  }

  if (payload.tags?.length) {
    metadata.tags = payload.tags;
  }

  if (payload.icon) {
    metadata.icon = payload.icon;
  }

  const record = await this.conversationsRepository.createProject({
    ownerId: user.id,
    title: payload.title.trim(),
    status: payload.status ?? 'active',
    metadata,
  });

  return this.presentProject(record);
}

  async listActivities(
    user: AuthenticatedUser,
    limit = 12,
  ): Promise<PresentedActivity[]> {
    const workspaceId = user.workspaceId as string;
    const activities = await this.activitiesRepository.listRecentByUser(
      workspaceId,
      user.id,
      limit,
    );
    return activities.map((activity) => ({
      id: activity.id,
      workspaceId: workspaceId,
      entityType: activity.entity_type,
      entityId: activity.entity_id,
      action: activity.action,
      payload: activity.metadata ?? {},
      createdAt: activity.created_at,
    }));
  }

  async listRecentWebhooks(
    user: AuthenticatedUser,
    limit = 10,
  ): Promise<PresentedWebhookEvent[]> {
    const workspaceId = user.workspaceId as string;
    const events = await this.webhookRepository.listRecentEvents(
      workspaceId,
      limit,
    );
    return events.map((event) => ({
      id: event.id,
      type: event.http_method ? event.http_method.toUpperCase() : 'WEBHOOK_EVENT',
      status: event.status,
      signatureValid: event.signature_valid,
      receivedAt: event.received_at,
    }));
  }

  private presentProject(record: ConversationRecord): PresentedProject {
    return {
      id: record.id,
      title: record.title,
      status: record.status,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      metadata: record.metadata ?? {},
    };
  }

  private normalizeProjects(
    records: Awaited<ReturnType<ConversationsRepository['listRecentByOwner']>>,
  ): PresentedProject[] {
    if (records.length > 0) {
      return records.map((project) => this.presentProject(project));
    }

    return [
      {
        id: 'sample-welcome',
        title: 'Boas-vindas Automatizadas',
        status: 'modelo',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          description:
            'Envie mensagens de boas-vindas e colete informacoes do novo lead.',
          tags: ['template', 'boas-vindas'],
        },
      },
      {
        id: 'sample-atendimento',
        title: 'Atendimento 24h com Escalonamento',
        status: 'modelo',
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          description:
            'Crie uma triagem automatica e escale conversas complexas para o time humano.',
          tags: ['template', 'atendimento'],
        },
      },
    ];
  }

  private normalizeActivities(
    records: Awaited<ReturnType<ActivitiesRepository['listRecentByUser']>>,
  ): PresentedActivity[] {
    if (records.length > 0) {
      return records.map((activity) => ({
        id: activity.id,
        workspaceId: activity.workspace_id,
        entityType: activity.entity_type,
        entityId: activity.entity_id,
        action: activity.action,
        payload: activity.metadata ?? {},
        createdAt: activity.created_at,
      }));
    }

    return [
      {
        id: 'activity-getting-started',
        workspaceId: 'system',
        entityType: 'guide',
        entityId: null,
        action: 'Leia o guia de primeiros passos e monte seu primeiro fluxo.',
        payload: {
          linkText: 'Abrir guia',
          linkHref: 'https://fluxolab.dev/docs/inicio',
        },
        createdAt: new Date(),
      },
      {
        id: 'activity-test-webhook',
        workspaceId: 'system',
        entityType: 'tip',
        entityId: null,
        action:
          'Teste o webhook padrao com um POST e acompanhe o payload em tempo real.',
        payload: {
          linkText: 'Ver como fazer',
          linkHref: 'https://fluxolab.dev/docs/webhooks',
        },
        createdAt: new Date(),
      },
    ];
  }

  private normalizeWebhooks(
    records: Awaited<
      ReturnType<WorkspaceWebhookRepository['listRecentEvents']>
    >,
  ): PresentedWebhookEvent[] {
    if (records.length > 0) {
      return records.map((event) => ({
        id: event.id,
        type: event.http_method ? event.http_method.toUpperCase() : 'WEBHOOK_EVENT',
        status: event.status,
        signatureValid: event.signature_valid,
        receivedAt: event.received_at,
      }));
    }

    return [
      {
        id: 'webhook-sample-1',
        type: 'meta_verification',
        status: 'processed',
        signatureValid: true,
        receivedAt: new Date(),
      },
    ];
  }

  private buildOnboardingBlocks(projectCount: number): OnboardingBlock[] {
    return [
      {
        id: 'onboarding-checklist',
        title: 'Checklist inicial',
        steps: [
          'Conecte sua conta WhatsApp Business',
          'Gere e configure o webhook no provedor externo',
          'Monte o primeiro fluxo usando um dos modelos prontos',
          'Execute um teste e valide o caminho de aprovacao',
        ],
        completed: projectCount > 0,
      },
    ];
  }
}
