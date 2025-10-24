import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../shared/database/database.service';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  avatarColor?: string;
  createdAt: Date;
  lastLoginAt: Date | null;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    workflow: boolean;
  };
  dashboard: {
    defaultView: 'overview' | 'workflows' | 'executions';
    itemsPerPage: number;
  };
}

export interface TrialInfo {
  isTrial: boolean;
  daysLeft: number;
  executionsUsed: number;
  executionsLimit: number;
  planName: string;
  features: string[];
  upgradeUrl?: string;
}

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  avatarColor?: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
  lastActiveAt: Date | null;
}

@Injectable()
export class UsersService {
  constructor(private readonly database: DatabaseService) {}

  private get pool() {
    return this.database.getPool();
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    const result = await this.pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.avatar,
        u.avatar_color,
        u.created_at,
        u.last_login_at,
        u.preferences
      FROM users u
      WHERE u.id = $1
    `, [userId]);

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('User not found');
    }

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      avatar: row.avatar,
      avatarColor: row.avatar_color,
      createdAt: row.created_at,
      lastLoginAt: row.last_login_at,
      preferences: row.preferences || this.getDefaultPreferences(),
    };
  }

  async updateUserProfile(userId: string, profileData: any): Promise<UserProfile> {
    const { name, email, avatar, avatarColor } = profileData;
    
    const result = await this.pool.query(`
      UPDATE users 
      SET 
        name = COALESCE($2, name),
        email = COALESCE($3, email),
        avatar = COALESCE($4, avatar),
        avatar_color = COALESCE($5, avatar_color),
        updated_at = NOW()
      WHERE id = $1
      RETURNING 
        id, name, email, avatar, avatar_color, created_at, last_login_at, preferences
    `, [userId, name, email, avatar, avatarColor]);

    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      avatar: row.avatar,
      avatarColor: row.avatar_color,
      createdAt: row.created_at,
      lastLoginAt: row.last_login_at,
      preferences: row.preferences || this.getDefaultPreferences(),
    };
  }

  async getTrialInfo(userId: string): Promise<TrialInfo> {
    // Get user's workspace and plan info
    const result = await this.pool.query(`
      SELECT 
        w.id as workspace_id,
        w.name as workspace_name,
        w.plan_name,
        w.trial_ends_at,
        w.created_at as workspace_created_at,
        COALESCE(exec_stats.executions_count, 0) as executions_used
      FROM users u
      JOIN workspaces w ON w.id = u.workspace_id
      LEFT JOIN (
        SELECT 
          workspace_id,
          COUNT(*) as executions_count
        FROM workflow_executions
        WHERE created_at >= w.created_at
        GROUP BY workspace_id
      ) exec_stats ON exec_stats.workspace_id = w.id
      WHERE u.id = $1
    `, [userId]);

    const row = result.rows[0];
    if (!row) {
      throw new NotFoundException('User workspace not found');
    }

    const isTrial = row.plan_name === 'trial' || row.trial_ends_at > new Date();
    const trialEndsAt = new Date(row.trial_ends_at);
    const daysLeft = Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    return {
      isTrial,
      daysLeft,
      executionsUsed: parseInt(row.executions_used),
      executionsLimit: isTrial ? 1000 : 10000, // Mock limits
      planName: row.plan_name || 'trial',
      features: this.getPlanFeatures(row.plan_name || 'trial'),
      upgradeUrl: isTrial ? '/settings/plans' : undefined,
    };
  }

  async getWorkspaceMembers(
    workspaceId: string,
    options: { limit: number; offset: number },
  ): Promise<{ members: WorkspaceMember[]; total: number }> {
    // Get total count
    const countResult = await this.pool.query(`
      SELECT COUNT(*) as total
      FROM users u
      WHERE u.workspace_id = $1
    `, [workspaceId]);

    const total = parseInt(countResult.rows[0].total);

    // Get members
    const membersResult = await this.pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.avatar,
        u.avatar_color,
        u.created_at as joined_at,
        u.last_login_at as last_active_at,
        CASE 
          WHEN w.owner_id = u.id THEN 'owner'
          WHEN u.role = 'admin' THEN 'admin'
          ELSE 'member'
        END as role
      FROM users u
      JOIN workspaces w ON w.id = u.workspace_id
      WHERE u.workspace_id = $1
      ORDER BY u.created_at ASC
      LIMIT $2 OFFSET $3
    `, [workspaceId, options.limit, options.offset]);

    const members = membersResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      avatar: row.avatar,
      avatarColor: row.avatar_color,
      role: row.role,
      joinedAt: row.joined_at,
      lastActiveAt: row.last_active_at,
    }));

    return { members, total };
  }

  async getUserPreferences(userId: string): Promise<UserPreferences> {
    const result = await this.pool.query(`
      SELECT preferences
      FROM users
      WHERE id = $1
    `, [userId]);

    const row = result.rows[0];
    return row?.preferences || this.getDefaultPreferences();
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const currentPreferences = await this.getUserPreferences(userId);
    const updatedPreferences = { ...currentPreferences, ...preferences };

    await this.pool.query(`
      UPDATE users
      SET preferences = $2, updated_at = NOW()
      WHERE id = $1
    `, [userId, JSON.stringify(updatedPreferences)]);

    return updatedPreferences;
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        push: true,
        workflow: true,
      },
      dashboard: {
        defaultView: 'overview',
        itemsPerPage: 50,
      },
    };
  }

  private getPlanFeatures(planName: string): string[] {
    const features: Record<string, string[]> = {
      trial: [
        'Up to 1000 executions per month',
        'Basic workflow templates',
        'Email support',
        '5 workflows maximum',
      ],
      basic: [
        'Up to 10,000 executions per month',
        'All workflow templates',
        'Priority email support',
        'Unlimited workflows',
        'Basic analytics',
      ],
      pro: [
        'Up to 100,000 executions per month',
        'All workflow templates',
        'Priority support',
        'Unlimited workflows',
        'Advanced analytics',
        'Custom integrations',
        'Team collaboration',
      ],
      enterprise: [
        'Unlimited executions',
        'All features',
        'Dedicated support',
        'Custom development',
        'On-premise deployment',
        'Advanced security',
        'SLA guarantee',
      ],
    };

    return features[planName] || features.trial;
  }
}

