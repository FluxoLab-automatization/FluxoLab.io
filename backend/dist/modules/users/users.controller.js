"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const require_workspace_guard_1 = require("../auth/require-workspace.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const users_service_1 = require("./users.service");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getProfile(user) {
        const profile = await this.usersService.getUserProfile(user.id);
        return {
            status: 'ok',
            profile,
        };
    }
    async updateProfile(user, profileData) {
        const updatedProfile = await this.usersService.updateUserProfile(user.id, profileData);
        return {
            status: 'ok',
            profile: updatedProfile,
        };
    }
    async getTrialInfo(user) {
        const trialInfo = await this.usersService.getTrialInfo(user.id);
        return {
            status: 'ok',
            trialInfo,
        };
    }
    async getWorkspaceMembers(user, limit, offset) {
        const workspaceId = user.workspaceId;
        const members = await this.usersService.getWorkspaceMembers(workspaceId, {
            limit: limit ? parseInt(limit, 10) : 50,
            offset: offset ? parseInt(offset, 10) : 0,
        });
        return {
            status: 'ok',
            members,
        };
    }
    async getUserPreferences(user) {
        const preferences = await this.usersService.getUserPreferences(user.id);
        return {
            status: 'ok',
            preferences,
        };
    }
    async updateUserPreferences(user, preferences) {
        const updatedPreferences = await this.usersService.updateUserPreferences(user.id, preferences);
        return {
            status: 'ok',
            preferences: updatedPreferences,
        };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Get)('profile'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Put)('profile'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Get)('trial-info'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getTrialInfo", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Get)('workspace-members'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getWorkspaceMembers", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Get)('preferences'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserPreferences", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Put)('preferences'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUserPreferences", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('api/users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map