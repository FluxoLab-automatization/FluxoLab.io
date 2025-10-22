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
const workflow_credentials_service_1 = require("./workflow-credentials.service");
const create_workflow_dto_1 = require("./dto/create-workflow.dto");
function checksum(definition) {
    return (0, crypto_1.createHash)('sha256').update(JSON.stringify(definition)).digest('hex');
}
let WorkflowsController = class WorkflowsController {
    workflows;
    executions;
    engine;
    credentials;
    constructor(workflows, executions, engine, credentials) {
        this.workflows = workflows;
        this.executions = executions;
        this.engine = engine;
        this.credentials = credentials;
    }
    async createWorkflow(user, payload) {
        const workspaceId = user.workspaceId;
        const definition = {
            nodes: payload.definition.nodes.map((node) => ({
                id: node.id,
                type: node.type,
                name: node.name,
                params: node.params ?? {},
                position: node.position,
                ports: node.ports?.map((port) => ({
                    id: port.id,
                    kind: port.kind,
                    label: port.label,
                    alignment: port.alignment,
                })),
                style: node.style,
            })),
            connections: payload.definition.connections.map((conn) => ({
                id: conn.id,
                from: conn.from,
                to: conn.to,
                output: conn.output,
                label: conn.label,
                variant: conn.variant,
                fromPort: conn.fromPort,
                toPort: conn.toPort,
            })),
        };
        const workflow = await this.workflows.createWorkflow({
            workspaceId,
            name: payload.name,
            createdBy: user.id,
            tags: payload.tags,
        });
        const version = await this.workflows.createVersion({
            workflowId: workflow.id,
            definition,
            checksum: checksum(definition),
            createdBy: user.id,
        });
        await this.workflows.activateVersion(workspaceId, workflow.id, version.id);
        return {
            status: 'created',
            workflow: {
                id: workflow.id,
                version: version.version,
            },
        };
    }
    async listWorkflows(user, limit, offset) {
        const workspaceId = user.workspaceId;
        const workflows = await this.workflows.listWorkflows(workspaceId, {
            limit: limit ? parseInt(limit, 10) : 50,
            offset: offset ? parseInt(offset, 10) : 0,
        });
        return {
            status: 'ok',
            workflows,
        };
    }
    async getCredentials(user) {
        const workspaceId = user.workspaceId;
        const credentials = await this.credentials.listCredentials(workspaceId);
        return {
            status: 'ok',
            credentials,
        };
    }
    async getWorkflow(user, workflowId) {
        const workspaceId = user.workspaceId;
        const workflow = await this.workflows.getWorkflow(workspaceId, workflowId);
        const activeVersion = await this.workflows.getActiveVersion(workspaceId, workflowId);
        return {
            status: 'ok',
            workflow: {
                ...workflow,
                definition: activeVersion.definition,
                version: activeVersion.version,
            },
        };
    }
    async updateWorkflow(user, workflowId, payload) {
        const workspaceId = user.workspaceId;
        if (payload.definition) {
            const definition = {
                nodes: payload.definition.nodes.map((node) => ({
                    id: node.id,
                    type: node.type,
                    name: node.name,
                    params: node.params ?? {},
                    position: node.position,
                    ports: node.ports?.map((port) => ({
                        id: port.id,
                        kind: port.kind,
                        label: port.label,
                        alignment: port.alignment,
                    })),
                    style: node.style,
                })),
                connections: payload.definition.connections.map((conn) => ({
                    id: conn.id,
                    from: conn.from,
                    to: conn.to,
                    output: conn.output,
                    label: conn.label,
                    variant: conn.variant,
                    fromPort: conn.fromPort,
                    toPort: conn.toPort,
                })),
            };
            const version = await this.workflows.createVersion({
                workflowId,
                definition,
                checksum: checksum(definition),
                createdBy: user.id,
            });
            await this.workflows.activateVersion(workspaceId, workflowId, version.id);
        }
        const updatedWorkflow = await this.workflows.updateWorkflow(workspaceId, workflowId, {
            name: payload.name,
            tags: payload.tags,
        });
        return {
            status: 'ok',
            workflow: updatedWorkflow,
        };
    }
    async deleteWorkflow(user, workflowId) {
        const workspaceId = user.workspaceId;
        await this.workflows.deleteWorkflow(workspaceId, workflowId);
        return {
            status: 'ok',
            message: 'Workflow deleted successfully',
        };
    }
    async listWorkflowExecutions(user, workflowId, limit, offset) {
        const workspaceId = user.workspaceId;
        const executions = await this.executions.listExecutions(workspaceId, workflowId, {
            limit: limit ? parseInt(limit, 10) : 50,
            offset: offset ? parseInt(offset, 10) : 0,
        });
        return {
            status: 'ok',
            executions,
        };
    }
    async executeWorkflow(user, workflowId, body) {
        const workspaceId = user.workspaceId;
        const activeVersion = await this.workflows.getActiveVersion(workspaceId, workflowId);
        const execution = await this.executions.createExecution({
            workspaceId,
            workflowId,
            workflowVersionId: activeVersion.id,
        });
        await this.engine.runInline({
            workspaceId,
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
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "listWorkflows", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Get)('credentials'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "getCredentials", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Get)(':workflowId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workflowId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "getWorkflow", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Put)(':workflowId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workflowId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "updateWorkflow", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Delete)(':workflowId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workflowId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "deleteWorkflow", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Get)(':workflowId/executions'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('workflowId')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], WorkflowsController.prototype, "listWorkflowExecutions", null);
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
        workflow_engine_service_1.WorkflowEngineService,
        workflow_credentials_service_1.WorkflowCredentialsService])
], WorkflowsController);
//# sourceMappingURL=workflows.controller.js.map