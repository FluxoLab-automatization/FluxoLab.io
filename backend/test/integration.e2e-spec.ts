import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, closeTestApp, testUtils } from './setup';

describe('Platform integrations (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let authToken: string;
  let userId: string;
  let workspaceId: string;

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  beforeEach(async () => {
    await testUtils.cleanupDatabase(app);

    const registerRes = await request(server).post('/api/auth/register').send({
      email: 'integration@test.dev',
      password: 'strong-password',
      displayName: 'Integration Test',
    });

    expect(registerRes.status).toBe(201);
    userId = registerRes.body.user.id;
    workspaceId = registerRes.body.user.workspaceId;

    const loginRes = await request(server).post('/api/auth/login').send({
      email: 'integration@test.dev',
      password: 'strong-password',
    });

    expect(loginRes.status).toBe(200);
    authToken = loginRes.body.token;
  });

  it('creates workflow, triggers via webhook, and exercises settings APIs', async () => {
    const workflowDefinition = {
      nodes: [
        {
          id: 'set1',
          type: 'set',
          name: 'Set message',
          params: {
            assign: {
              message: 'Hello FluxoLab',
            },
          },
        },
      ],
      connections: [],
    };

    const createWorkflowRes = await request(server)
      .post('/api/workflows')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Integration Flow',
        definition: workflowDefinition,
      });

    expect(createWorkflowRes.status).toBe(201);
    const workflowId: string = createWorkflowRes.body.workflow.id;

    const triggerRes = await request(server)
      .post(`/api/workflows/${workflowId}/test`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ sample: true });

    expect(triggerRes.status).toBe(200);
    expect(triggerRes.body.executionId).toBeDefined();

    const webhookRegistrationRes = await request(server)
      .post('/api/generate-webhook')
      .send({
        workspaceId,
        workflowId,
        userId,
        respondMode: 'immediate',
      });

    expect(webhookRegistrationRes.status).toBe(201);
    const webhookToken: string = webhookRegistrationRes.body.token;

    const webhookCallRes = await request(server)
      .post(`/api/webhooks/${webhookToken}`)
      .set('Content-Type', 'application/json')
      .send({ payload: 'sample' });

    expect([200, 202]).toContain(webhookCallRes.status);
    expect(webhookCallRes.body.status).toBeDefined();

    const summaryRes = await request(server)
      .get('/api/settings/summary')
      .set('Authorization', `Bearer ${authToken}`);

    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body.summary).toBeDefined();

    const environments = summaryRes.body.summary.environments ?? [];
    const environmentId: string | undefined = environments[0]?.id;

    const usageHistoryRes = await request(server)
      .get('/api/settings/usage/history')
      .query({ period: '7d' })
      .set('Authorization', `Bearer ${authToken}`);

    expect(usageHistoryRes.status).toBe(200);
    expect(Array.isArray(usageHistoryRes.body.data)).toBe(true);

    const usageAlertRes = await request(server)
      .post('/api/settings/usage/alerts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        metric: 'webhooks',
        threshold: 5,
        condition: 'greater_than',
        window: '24h',
        channel: 'email',
      });

    expect(usageAlertRes.status).toBe(200);
    expect(usageAlertRes.body.alert.id).toBeDefined();

    const apiKeyRes = await request(server)
      .post('/api/settings/api/keys')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        label: 'CI Key',
        scopes: ['workflows:read'],
      });

    expect(apiKeyRes.status).toBe(200);
    expect(apiKeyRes.body.token).toBeDefined();
    const apiKeyId: string = apiKeyRes.body.key.id;

    const usageRes = await request(server)
      .get(`/api/settings/api/keys/${apiKeyId}/usage`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(usageRes.status).toBe(200);

    const rotateRes = await request(server)
      .put(`/api/settings/api/keys/${apiKeyId}/rotate`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(rotateRes.status).toBe(200);

    const revokeRes = await request(server)
      .delete(`/api/settings/api/keys/${apiKeyId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(revokeRes.status).toBe(200);

    const integrationsStatusRes = await request(server)
      .get('/api/settings/integrations/status')
      .set('Authorization', `Bearer ${authToken}`);
    expect(integrationsStatusRes.status).toBe(200);

    if (environmentId) {
      const environmentUpdateRes = await request(server)
        .put(`/api/settings/environments/${environmentId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'inactive' });
      expect(environmentUpdateRes.status).toBe(200);
    }

    const configureSsoRes = await request(server)
      .post('/api/settings/sso/configure')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        provider: 'okta',
        clientId: 'client-id',
        clientSecret: 'client-secret',
        enabled: true,
      });
    expect(configureSsoRes.status).toBe(200);

    const configureLdapRes = await request(server)
      .post('/api/settings/ldap/configure')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        host: 'ldap.local',
        port: 389,
        baseDn: 'dc=local',
        bindDn: 'cn=admin,dc=local',
        bindPassword: 'secret',
        enabled: false,
      });
    expect(configureLdapRes.status).toBe(200);

    const configureLogRes = await request(server)
      .post('/api/settings/logs/configure')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        destination: 'datadog',
        endpoint: 'https://http-intake.logs.datadoghq.com',
        apiKey: 'dd-api-key',
        enabled: true,
      });
    expect(configureLogRes.status).toBe(200);
  });
});
