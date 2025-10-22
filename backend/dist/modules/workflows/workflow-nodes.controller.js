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
exports.WorkflowNodesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const require_workspace_guard_1 = require("../auth/require-workspace.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const workflow_nodes_service_1 = require("./workflow-nodes.service");
let WorkflowNodesController = class WorkflowNodesController {
    workflowNodesService;
    constructor(workflowNodesService) {
        this.workflowNodesService = workflowNodesService;
    }
    async getNodeTemplates(user) {
        const templates = await this.workflowNodesService.getNodeTemplates();
        return {
            status: 'ok',
            templates,
        };
    }
    async getNodeCategories(user) {
        const categories = await this.workflowNodesService.getNodeCategories();
        return {
            status: 'ok',
            categories,
        };
    }
    async getTriggerTypes(user) {
        const triggers = await this.workflowNodesService.getTriggerTypes();
        return {
            status: 'ok',
            triggers,
        };
    }
    async validateNode(user, nodeData) {
        const validation = await this.workflowNodesService.validateNode(nodeData);
        return {
            status: 'ok',
            validation,
        };
    }
    async testNode(user, testData) {
        const result = await this.workflowNodesService.testNode(testData);
        return {
            status: 'ok',
            result,
        };
    }
    async getNodeConfigSchema(user, nodeType) {
        const schema = await this.workflowNodesService.getNodeConfigSchema(nodeType);
        return {
            status: 'ok',
            schema,
        };
    }
};
exports.WorkflowNodesController = WorkflowNodesController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Get)('templates'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkflowNodesController.prototype, "getNodeTemplates", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Get)('categories'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkflowNodesController.prototype, "getNodeCategories", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Get)('triggers'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkflowNodesController.prototype, "getTriggerTypes", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Post)('validate'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorkflowNodesController.prototype, "validateNode", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Post)('test'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WorkflowNodesController.prototype, "testNode", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Get)('config-schema/:nodeType'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('nodeType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WorkflowNodesController.prototype, "getNodeConfigSchema", null);
exports.WorkflowNodesController = WorkflowNodesController = __decorate([
    (0, common_1.Controller)('api/workflows/nodes'),
    __metadata("design:paramtypes", [workflow_nodes_service_1.WorkflowNodesService])
], WorkflowNodesController);
//# sourceMappingURL=workflow-nodes.controller.js.map