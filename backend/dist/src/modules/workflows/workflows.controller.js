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
exports.WorkflowsController = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const require_workspace_guard_1 = require("../auth/require-workspace.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const workflows_service_1 = require("./workflows.service");
const workflow_executions_service_1 = require("./workflow-executions.service");
const workflow_engine_service_1 = require("./workflow-engine.service");
const create_workflow_dto_1 = require("./dto/create-workflow.dto");
function checksum(definition) {
    return (0, crypto_1.createHash)('sha256').update(JSON.stringify(definition)).digest('hex');
}
let WorkflowsController = class WorkflowsController {
    workflows;
    executions;
    engine;
    constructor(workflows, executions, engine) {
        this.workflows = workflows;
        this.executions = executions;
        this.engine = engine;
    }
    async createWorkflow(user, payload) {
        const workflow = await this.workflows.createWorkflow({
            workspaceId: user.workspaceId,
            name: payload.name,
            createdBy: user.id,
            tags: payload.tags,
        });
        const version = await this.workflows.createVersion({
            workflowId: workflow.id,
            definition: payload.definition,
            checksum: checksum(payload.definition),
            createdBy: user.id,
        });
        await this.workflows.activateVersion(user.workspaceId, workflow.id, version.id);
        return {
            status: 'created',
            workflow: {
                id: workflow.id,
                version: version.version,
            },
        };
    }
    async executeWorkflow(user, workflowId, body) {
        const activeVersion = await this.workflows.getActiveVersion(user.workspaceId, workflowId);
        const execution = await this.executions.createExecution({
            workspaceId: user.workspaceId,
            workflowId,
            workflowVersionId: activeVersion.id,
        });
        await this.engine.runInline({
            workspaceId: user.workspaceId,
            workflowId,
            executionId: execution.id,
            initialItems: [{ json: body }],
        });
        return {
            status: 'ok',
            executionId: execution.id,
        };
    }
};
exports.WorkflowsController = WorkflowsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_workflow_dto_1.CreateWorkflowDto]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "createWorkflow", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Post)(':workflowId/test'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workflowId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "executeWorkflow", null);
exports.WorkflowsController = WorkflowsController = __decorate([
    (0, common_1.Controller)('api/workflows'),
    __metadata("design:paramtypes", [workflows_service_1.WorkflowsService,
        workflow_executions_service_1.WorkflowExecutionsService,
        workflow_engine_service_1.WorkflowEngineService])
], WorkflowsController);
//# sourceMappingURL=workflows.controller.js.map