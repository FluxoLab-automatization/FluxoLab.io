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
exports.ProjectSharingController = void 0;
const common_1 = require("@nestjs/common");
const project_sharing_service_1 = require("./project-sharing.service");
const project_sharing_dto_1 = require("./dto/project-sharing.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const require_workspace_guard_1 = require("../auth/require-workspace.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let ProjectSharingController = class ProjectSharingController {
    projectSharingService;
    constructor(projectSharingService) {
        this.projectSharingService = projectSharingService;
    }
    shareProject(workflowId, shareProjectDto, user, req) {
        return this.projectSharingService.shareProject(req.workspace.id, workflowId, user.id, shareProjectDto);
    }
    getSharedProjects(query, req) {
        return this.projectSharingService.getSharedProjects(req.workspace.id, query);
    }
    getSharedProjectByToken(token) {
        return this.projectSharingService.getSharedProjectByToken(token);
    }
    updateSharedProject(id, updateSharedProjectDto, user, req) {
        return this.projectSharingService.updateSharedProject(req.workspace.id, id, user.id, updateSharedProjectDto);
    }
    deleteSharedProject(id, user, req) {
        return this.projectSharingService.deleteSharedProject(req.workspace.id, id, user.id);
    }
    forkProject(id, forkProjectDto, user, req) {
        return this.projectSharingService.forkProject(req.workspace.id, id, user.id, forkProjectDto);
    }
    createComment(id, createCommentDto, user) {
        return this.projectSharingService.createComment(id, user.id, createCommentDto);
    }
    getComments(id) {
        return this.projectSharingService.getComments(id);
    }
    toggleLike(id, user) {
        return this.projectSharingService.toggleLike(id, user.id);
    }
    getLikes(id) {
        return this.projectSharingService.getLikes(id);
    }
};
exports.ProjectSharingController = ProjectSharingController;
__decorate([
    (0, common_1.Post)('workflows/:workflowId/share'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    __param(0, (0, common_1.Param)('workflowId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, project_sharing_dto_1.ShareProjectDto, Object, Object]),
    __metadata("design:returntype", void 0)
], ProjectSharingController.prototype, "shareProject", null);
__decorate([
    (0, common_1.Get)('projects'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_sharing_dto_1.GetSharedProjectsDto, Object]),
    __metadata("design:returntype", void 0)
], ProjectSharingController.prototype, "getSharedProjects", null);
__decorate([
    (0, common_1.Get)('shared/:token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectSharingController.prototype, "getSharedProjectByToken", null);
__decorate([
    (0, common_1.Put)('projects/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, project_sharing_dto_1.UpdateSharedProjectDto, Object, Object]),
    __metadata("design:returntype", void 0)
], ProjectSharingController.prototype, "updateSharedProject", null);
__decorate([
    (0, common_1.Delete)('projects/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], ProjectSharingController.prototype, "deleteSharedProject", null);
__decorate([
    (0, common_1.Post)('projects/:id/fork'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, project_sharing_dto_1.ForkProjectDto, Object, Object]),
    __metadata("design:returntype", void 0)
], ProjectSharingController.prototype, "forkProject", null);
__decorate([
    (0, common_1.Post)('projects/:id/comments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, project_sharing_dto_1.CreateProjectCommentDto, Object]),
    __metadata("design:returntype", void 0)
], ProjectSharingController.prototype, "createComment", null);
__decorate([
    (0, common_1.Get)('projects/:id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectSharingController.prototype, "getComments", null);
__decorate([
    (0, common_1.Post)('projects/:id/like'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ProjectSharingController.prototype, "toggleLike", null);
__decorate([
    (0, common_1.Get)('projects/:id/likes'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProjectSharingController.prototype, "getLikes", null);
exports.ProjectSharingController = ProjectSharingController = __decorate([
    (0, common_1.Controller)('api/project-sharing'),
    __metadata("design:paramtypes", [project_sharing_service_1.ProjectSharingService])
], ProjectSharingController);
//# sourceMappingURL=project-sharing.controller.js.map