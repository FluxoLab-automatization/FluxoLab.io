"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapToAuthenticatedUser = mapToAuthenticatedUser;
exports.mapToPresentedUser = mapToPresentedUser;
exports.presentAuthenticatedUser = presentAuthenticatedUser;
function mapToAuthenticatedUser(record) {
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
function mapToPresentedUser(record) {
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
function presentAuthenticatedUser(user) {
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
//# sourceMappingURL=auth.mapper.js.map