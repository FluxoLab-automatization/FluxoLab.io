import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from '../src/config/env.validation';
import { DatabaseModule } from '../src/shared/database/database.module';
import { AuthModule } from '../src/modules/auth/auth.module';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.test',
        validate: validateEnv,
      }),
      DatabaseModule,
      AuthModule,
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  
  // Configure test middleware
  app.use((req, res, next) => {
    req.headers['x-test'] = 'true';
    next();
  });

  await app.init();
  return app;
}

export async function closeTestApp(app: INestApplication): Promise<void> {
  await app.close();
}

// Test utilities
export const testUtils = {
  async cleanupDatabase(app: INestApplication): Promise<void> {
    // Clean up test data
    const databaseService = app.get('DatabaseService');
    await databaseService.getPool().query('TRUNCATE TABLE users CASCADE');
  },

  createTestUser(): any {
    return {
      email: 'test@example.com',
      displayName: 'Test User',
      password: 'password123',
    };
  },

  createTestJWT(): string {
    // Create a test JWT token
    return 'test-jwt-token';
  },
};
