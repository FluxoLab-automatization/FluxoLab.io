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
exports.WorkspaceController = void 0;
const common_1 = require("@nestjs/common");
const workspace_service_1 = require("./workspace.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const require_workspace_guard_1 = require("../auth/require-workspace.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const create_project_dto_1 = require("./dto/create-project.dto");
let WorkspaceController = class WorkspaceController {
    workspaceService;
    constructor(workspaceService) {
        this.workspaceService = workspaceService;
    }
    async getOverview(user) {
        const overview = await this.workspaceService.getOverview(user);
        return {
            status: 'ok',
            overview,
        };
    }
    async listProjects(user, limit) {
        const projects = await this.workspaceService.listProjects(user, limit);
        return {
            status: 'ok',
            projects,
        };
    }
    async listActivities(user, limit) {
        const activities = await this.workspaceService.listActivities(user, limit);
        return {
            status: 'ok',
            activities,
        };
    }
    async createProject(user, payload) {
        const project = await this.workspaceService.createProject(user, payload);
        return {
            status: 'created',
            project,
        };
    }
    async listRecentWebhooks(user, limit) {
        const events = await this.workspaceService.listRecentWebhooks(user, limit);
        return {
            status: 'ok',
            events,
        };
    }
};
exports.WorkspaceController = WorkspaceController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Get)('overview'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkspaceController.prototype, "getOverview", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Get)('projects'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(12), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], WorkspaceController.prototype, "listProjects", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Get)('activities'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(12), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], WorkspaceController.prototype, "listActivities", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Post)('projects'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_project_dto_1.CreateProjectDto]),
    __metadata("design:returntype", Promise)
], WorkspaceController.prototype, "createProject", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Get)('webhooks/recent'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], WorkspaceController.prototype, "listRecentWebhooks", null);
exports.WorkspaceController = WorkspaceController = __decorate([
    (0, common_1.Controller)('api/workspace'),
    __metadata("design:paramtypes", [workspace_service_1.WorkspaceService])
], WorkspaceController);
//# sourceMappingURL=workspace.controller.js.map