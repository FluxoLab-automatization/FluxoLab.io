import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../config/env.validation';
import type { AuthenticatedUser } from '../auth/auth.types';
import { ConversationsRepository } from './repositories/conversations.repository';
import { ActivitiesRepository } from './repositories/activities.repository';
import { WorkspaceWebhookRepository } from './repositories/webhook-events.repository';

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
    private readonly config: ConfigService<AppConfig, true>,
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
    ] = await Promise.all([
      this.conversationsRepository.listRecentByOwner(user.id, 6),
      this.activitiesRepository.listRecentByUser(user.id, 8),
      this.conversationsRepository.countByOwner(user.id),
      this.webhookRepository.countRegistrations(workspaceId),
      this.webhookRepository.countEvents(workspaceId),
      this.webhookRepository.listRecentEvents(workspaceId, 5),
    ]);

    return {
      metrics: {
        totalProjects,
        totalWebhooks,
        totalEvents,
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
    return projects.map((project) => ({
      id: project.id,
      title: project.title,
      status: project.status,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      metadata: project.metadata ?? {},
    }));
  }

  async listActivities(
    user: AuthenticatedUser,
    limit = 12,
  ): Promise<PresentedActivity[]> {
    const activities = await this.activitiesRepository.listRecentByUser(
      user.id,
      limit,
    );
    return activities.map((activity) => ({
      id: activity.id,
      entityType: activity.entity_type,
      entityId: activity.entity_id,
      action: activity.action,
      payload: activity.payload ?? {},
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
      type: event.event_type,
      status: event.status,
      signatureValid: event.signature_valid,
      receivedAt: event.received_at,
    }));
  }

  private normalizeProjects(
    records: Awaited<ReturnType<ConversationsRepository['listRecentByOwner']>>,
  ): PresentedProject[] {
    if (records.length > 0) {
      return records.map((project) => ({
        id: project.id,
        title: project.title,
        status: project.status,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        metadata: project.metadata ?? {},
      }));
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
        entityType: activity.entity_type,
        entityId: activity.entity_id,
        action: activity.action,
        payload: activity.payload ?? {},
        createdAt: activity.created_at,
      }));
    }

    return [
      {
        id: 'activity-getting-started',
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
        type: event.event_type,
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
