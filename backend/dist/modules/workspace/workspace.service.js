"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceService = void 0;
const common_1 = require("@nestjs/common");
const conversations_repository_1 = require("./repositories/conversations.repository");
const activities_repository_1 = require("./repositories/activities.repository");
const webhook_events_repository_1 = require("./repositories/webhook-events.repository");
const workspace_usage_repository_1 = require("./repositories/workspace-usage.repository");
let WorkspaceService = class WorkspaceService {
    conversationsRepository;
    activitiesRepository;
    webhookRepository;
    usageRepository;
    constructor(conversationsRepository, activitiesRepository, webhookRepository, usageRepository) {
        this.conversationsRepository = conversationsRepository;
        this.activitiesRepository = activitiesRepository;
        this.webhookRepository = webhookRepository;
        this.usageRepository = usageRepository;
    }
    async getOverview(user) {
        const workspaceId = user.workspaceId;
        const [conversations, activities, totalProjects, totalWebhooks, totalEvents, recentEvents, usageSnapshot,] = await Promise.all([
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
    async listProjects(user, limit = 12) {
        const projects = await this.conversationsRepository.listRecentByOwner(user.id, limit);
        return projects.map((project) => this.presentProject(project));
    }
    async createProject(user, payload) {
        const metadata = {};
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
    async listActivities(user, limit = 12) {
        const workspaceId = user.workspaceId;
        const activities = await this.activitiesRepository.listRecentByUser(workspaceId, user.id, limit);
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
    async listRecentWebhooks(user, limit = 10) {
        const workspaceId = user.workspaceId;
        const events = await this.webhookRepository.listRecentEvents(workspaceId, limit);
        return events.map((event) => ({
            id: event.id,
            type: event.http_method ? event.http_method.toUpperCase() : 'WEBHOOK_EVENT',
            status: event.status,
            signatureValid: event.signature_valid,
            receivedAt: event.received_at,
        }));
    }
    presentProject(record) {
        return {
            id: record.id,
            title: record.title,
            status: record.status,
            createdAt: record.created_at,
            updatedAt: record.updated_at,
            metadata: record.metadata ?? {},
        };
    }
    normalizeProjects(records) {
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
                    description: 'Envie mensagens de boas-vindas e colete informacoes do novo lead.',
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
                    description: 'Crie uma triagem automatica e escale conversas complexas para o time humano.',
                    tags: ['template', 'atendimento'],
                },
            },
        ];
    }
    normalizeActivities(records) {
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
                action: 'Teste o webhook padrao com um POST e acompanhe o payload em tempo real.',
                payload: {
                    linkText: 'Ver como fazer',
                    linkHref: 'https://fluxolab.dev/docs/webhooks',
                },
                createdAt: new Date(),
            },
        ];
    }
    normalizeWebhooks(records) {
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
    buildOnboardingBlocks(projectCount) {
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
};
exports.WorkspaceService = WorkspaceService;
exports.WorkspaceService = WorkspaceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [conversations_repository_1.ConversationsRepository,
        activities_repository_1.ActivitiesRepository,
        webhook_events_repository_1.WorkspaceWebhookRepository,
        workspace_usage_repository_1.WorkspaceUsageRepository])
], WorkspaceService);
//# sourceMappingURL=workspace.service.js.map