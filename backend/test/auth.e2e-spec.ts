import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { createTestApp, closeTestApp, testUtils } from './setup';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  beforeEach(async () => {
    await testUtils.cleanupDatabase(app);
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      const userData = testUtils.createTestUser();
      
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(userData)
        .expect(201)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.user.email).toBe(userData.email);
          expect(res.body.user.displayName).toBe(userData.displayName);
          expect(res.body.user.password).toBeUndefined();
        });
    });

    it('should not register user with duplicate email', async () => {
      const userData = testUtils.createTestUser();
      
      // First registration
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Second registration with same email
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(userData)
        .expect(409)
        .expect((res) => {
          expect(res.body.status).toBe('error');
          expect(res.body.message).toContain('already exists');
        });
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({})
        .expect(400)
        .expect((res) => {
          expect(res.body.status).toBe('error');
        });
    });

    it('should validate email format', () => {
      const userData = {
        ...testUtils.createTestUser(),
        email: 'invalid-email',
      };

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(userData)
        .expect(400)
        .expect((res) => {
          expect(res.body.status).toBe('error');
        });
    });
  });

  describe('/auth/login (POST)', () => {
    beforeEach(async () => {
      // Register a test user
      const userData = testUtils.createTestUser();
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(userData);
    });

    it('should login with valid credentials', () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send(credentials)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.token).toBeDefined();
          expect(res.body.user.email).toBe(credentials.email);
        });
    });

    it('should not login with invalid credentials', () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send(credentials)
        .expect(401)
        .expect((res) => {
          expect(res.body.status).toBe('error');
          expect(res.body.message).toContain('invalid');
        });
    });

    it('should not login with non-existent user', () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send(credentials)
        .expect(401)
        .expect((res) => {
          expect(res.body.status).toBe('error');
          expect(res.body.message).toContain('invalid');
        });
    });
  });

  describe('/auth/me (GET)', () => {
    let authToken: string;

    beforeEach(async () => {
      // Register and login
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

    it('should return user data with valid token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.user.email).toBe('test@example.com');
          expect(res.body.user.password).toBeUndefined();
        });
    });

    it('should not return user data without token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401)
        .expect((res) => {
          expect(res.body.statusCode).toBe(401);
        });
    });

    it('should not return user data with invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
        .expect((res) => {
          expect(res.body.statusCode).toBe(401);
        });
    });
  });
});
