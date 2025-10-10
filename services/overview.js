const conversationsRepository = require('../db/conversations');
const activitiesRepository = require('../db/activities');
const webhooksRepository = require('../db/repository');

function formatConversation(row) {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    metadata: row.metadata || {},
  };
}

function formatActivity(row) {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    action: row.action,
    payload: row.payload || {},
    createdAt: row.created_at,
  };
}

function formatWebhookEvent(row) {
  return {
    id: row.id,
    type: row.event_type,
    status: row.status,
    signatureValid: row.signature_valid,
    receivedAt: row.received_at,
  };
}

async function buildOverview(user) {
  const [
    conversations,
    activities,
    totalProjects,
    metrics,
    recentEvents,
  ] = await Promise.all([
    conversationsRepository.listRecentByOwner(user.id, { limit: 6 }),
    activitiesRepository.listRecentByUser(user.id, { limit: 8 }),
    conversationsRepository.countByOwner(user.id),
    fetchMetrics(),
    webhooksRepository.listRecentEvents({ limit: 5 }),
  ]);

  return {
    metrics: {
      totalProjects,
      totalWebhooks: metrics.totalWebhooks,
      totalEvents: metrics.totalEvents,
    },
    projects: normalizeProjects(conversations),
    activities: normalizeActivities(activities),
    recentWebhooks: normalizeWebhooks(recentEvents),
    onboarding: buildOnboardingBlocks(conversations.length),
  };
}

async function fetchMetrics() {
  const [totalWebhooks, totalEvents] = await Promise.all([
    webhooksRepository.countRegistrations(),
    webhooksRepository.countEvents(),
  ]);

  return {
    totalWebhooks,
    totalEvents,
  };
}

function normalizeProjects(rows) {
  if (rows.length) {
    return rows.map(formatConversation);
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
          'Envie mensagens de boas-vindas e colete informações do novo lead.',
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
          'Crie uma triagem automática e escale conversas complexas para o time humano.',
        tags: ['template', 'atendimento'],
      },
    },
  ];
}

function normalizeActivities(rows) {
  if (rows.length) {
    return rows.map(formatActivity);
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
        'Teste o webhook padrão com um POST e acompanhe o payload em tempo real.',
      payload: {
        linkText: 'Ver como fazer',
        linkHref: 'https://fluxolab.dev/docs/webhooks',
      },
      createdAt: new Date(),
    },
  ];
}

function normalizeWebhooks(rows) {
  if (rows.length) {
    return rows.map(formatWebhookEvent);
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

function buildOnboardingBlocks(projectCount) {
  return [
    {
      id: 'onboarding-checklist',
      title: 'Checklist inicial',
      steps: [
        'Conecte sua conta WhatsApp Business',
        'Gere e configure o webhook no provedor externo',
        'Monte o primeiro fluxo usando um dos modelos prontos',
        'Execute um teste e valide o caminho de aprovação',
      ],
      completed: projectCount > 0,
    },
  ];
}

module.exports = {
  buildOverview,
  __test__: {
    normalizeProjects,
    normalizeActivities,
    normalizeWebhooks,
    buildOnboardingBlocks,
  },
};
