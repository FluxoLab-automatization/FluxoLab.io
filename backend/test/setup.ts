import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { DatabaseService } from '../src/shared/database/database.service';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
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
    const databaseService = app.get(DatabaseService);
    try {
      await databaseService.getPool().query(`
        TRUNCATE TABLE
          workspace_integration_events,
          workspace_api_key_audit,
          workspace_usage_alerts,
          webhook_events,
          webhook_registrations,
          workflow_versions,
          workflows,
          credentials,
          workspace_members,
          workspace_settings,
          workspace_api_keys,
          workspace_environments,
          workspace_secret_providers,
          workspace_sso_configs,
          workspace_ldap_configs,
          workspace_log_destinations,
          workspace_community_connectors,
          workspace_usage_snapshots,
          workspace_subscriptions,
          workspaces,
          users
        RESTART IDENTITY CASCADE
      `);
    } catch (error: any) {
      if (error?.code !== '42P01') {
        throw error;
      }
      await databaseService
        .getPool()
        .query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
      return;
    }
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
