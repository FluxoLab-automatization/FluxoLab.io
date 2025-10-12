export type AuthenticatedUser = {
  id: string;
  email: string;
  displayName: string;
  avatarColor?: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
  workspaceId: string | null; // <- importante
};

export type PresentedUser = {
  id: string;
  email: string;
  displayName: string;
  avatarColor?: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
  workspaceId: string | null; // <- importante
};
