import { UserRecord } from './users.repository';
import { AuthenticatedUser, PresentedUser } from './auth.types';

export function mapToAuthenticatedUser(record: UserRecord): AuthenticatedUser {
  if (!record) throw new Error('UserRecord indefinido');

  const workspaceId =
    (record as any).workspace_id ??
    (record as any).workspaceId ??
    (record as any).default_workspace_id ??
    (record as any).defaultWorkspaceId ??
    null; // <- não lança!

  return {
    id: record.id,
    email: record.email,
    displayName: record.display_name,
    avatarColor: record.avatar_color ?? '#6366F1',
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    lastLoginAt: record.last_login_at ?? null,
    workspaceId,
  };
}

export function mapToPresentedUser(record: UserRecord): PresentedUser {
  const workspaceId =
    (record as any).workspace_id ??
    (record as any).workspaceId ??
    (record as any).default_workspace_id ??
    (record as any).defaultWorkspaceId ??
    null;

  return {
    id: record.id,
    email: record.email,
    displayName: record.display_name,
    avatarColor: record.avatar_color ?? '#6366F1',
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    lastLoginAt: record.last_login_at ?? null,
    workspaceId, // <- inclua no DTO apresentado ao front
  };
}

export function presentAuthenticatedUser(user: AuthenticatedUser): PresentedUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarColor: user.avatarColor ?? '#6366F1',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt ?? null,
    workspaceId: user.workspaceId ?? null,
  };
}
