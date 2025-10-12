import { UserRecord } from './users.repository';
import { AuthenticatedUser, PresentedUser } from './auth.types';

export function mapToAuthenticatedUser(record: UserRecord): AuthenticatedUser {
  return {
    id: record.id,
    email: record.email,
    displayName: record.display_name,
    avatarColor: record.avatar_color ?? '#6366F1',
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    lastLoginAt: record.last_login_at,
  };
}

export function mapToPresentedUser(record: UserRecord): PresentedUser {
  return {
    id: record.id,
    email: record.email,
    displayName: record.display_name,
    avatarColor: record.avatar_color ?? '#6366F1',
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    lastLoginAt: record.last_login_at,
  };
}

export function presentAuthenticatedUser(
  user: AuthenticatedUser,
): PresentedUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarColor: user.avatarColor ?? '#6366F1',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
  };
}
