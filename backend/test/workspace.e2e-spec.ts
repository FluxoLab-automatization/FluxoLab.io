import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { createTestApp, closeTestApp, testUtils } from './setup';

describe('Workspace (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  beforeEach(async () => {
    await testUtils.cleanupDatabase(app);
    
    // Setup authenticated user
    const userData = testUtils.createTestUser();
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(userData);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: userData.email,
        password: userData.password,
      });

    authToken = loginResponse.body.token;
  });

  describe('/workspace/overview (GET)', () => {
    it('should return workspace overview for authenticated user', () => {
      return request(app.getHttpServer())
        .get('/api/workspace/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.overview).toBeDefined();
          expect(res.body.overview.metrics).toBeDefined();
          expect(res.body.overview.projects).toBeDefined();
          expect(res.body.overview.activities).toBeDefined();
          expect(res.body.overview.recentWebhooks).toBeDefined();
          expect(res.body.overview.onboarding).toBeDefined();
        });
    });

    it('should not return overview without authentication', () => {
      return request(app.getHttpServer())
        .get('/api/workspace/overview')
        .expect(401);
    });
  });


describe('/workspace/projects (POST)', () => {
  it('should create a new project for the authenticated user', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/workspace/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Projeto Dashboard',
        description: 'Configuração rápida do painel',
        tags: ['dashboard'],
      })
      .expect(201);

    expect(response.body.status).toBe('created');
    expect(response.body.project).toBeDefined();
    expect(response.body.project.title).toBe('Projeto Dashboard');
    expect(Array.isArray(response.body.project.metadata.tags)).toBe(true);
  });
});

  describe('/workspace/projects (GET)', () => {
    it('should return projects list', () => {
      return request(app.getHttpServer())
        .get('/api/workspace/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.projects).toBeDefined();
          expect(Array.isArray(res.body.projects)).toBe(true);
        });
    });

    it('should respect limit parameter', () => {
      return request(app.getHttpServer())
        .get('/api/workspace/projects?limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.projects.length).toBeLessThanOrEqual(5);
        });
    });
  });

  describe('/workspace/activities (GET)', () => {
    it('should return activities list', () => {
      return request(app.getHttpServer())
        .get('/api/workspace/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.activities).toBeDefined();
          expect(Array.isArray(res.body.activities)).toBe(true);
        });
    });

    it('should respect limit parameter', () => {
      return request(app.getHttpServer())
        .get('/api/workspace/activities?limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.activities.length).toBeLessThanOrEqual(10);
        });
    });
  });

  describe('/workspace/webhooks/recent (GET)', () => {
    it('should return recent webhooks', () => {
      return request(app.getHttpServer())
        .get('/api/workspace/webhooks/recent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.events).toBeDefined();
          expect(Array.isArray(res.body.events)).toBe(true);
        });
    });

    it('should respect limit parameter', () => {
      return request(app.getHttpServer())
        .get('/api/workspace/webhooks/recent?limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.events.length).toBeLessThanOrEqual(5);
        });
    });
  });
});
