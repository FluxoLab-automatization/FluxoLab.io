export interface AuthenticatedUser {
    id: string;
    email: string;
    displayName: string;
    avatarColor: string | null;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date | null;
}
export interface PresentedUser {
    id: string;
    email: string;
    displayName: string;
    avatarColor: string | null;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date | null;
}
