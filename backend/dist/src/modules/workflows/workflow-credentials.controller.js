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
exports.WorkflowCredentialsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const require_workspace_guard_1 = require("../auth/require-workspace.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const workflow_credentials_service_1 = require("./workflow-credentials.service");
const create_credential_dto_1 = require("./dto/create-credential.dto");
let WorkflowCredentialsController = class WorkflowCredentialsController {
    credentialsService;
    constructor(credentialsService) {
        this.credentialsService = credentialsService;
    }
    async list(user) {
        const credentials = await this.credentialsService.listCredentials(user.workspaceId);
        return {
            status: 'ok',
            credentials,
        };
    }
    async create(user, payload) {
        const secret = payload.secret ?? {};
        const credential = await this.credentialsService.createCredential({
            workspaceId: user.workspaceId,
            name: payload.name,
            type: payload.type,
            secret,
            createdBy: user.id,
        });
        return {
            status: 'created',
            credential: {
                id: credential.id,
                name: credential.name,
                type: credential.type,
                createdAt: credential.createdAt,
            },
        };
    }
};
exports.WorkflowCredentialsController = WorkflowCredentialsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkflowCredentialsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_credential_dto_1.CreateCredentialDto]),
    __metadata("design:returntype", Promise)
], WorkflowCredentialsController.prototype, "create", null);
exports.WorkflowCredentialsController = WorkflowCredentialsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    (0, common_1.Controller)('api/workflows/credentials'),
    __metadata("design:paramtypes", [workflow_credentials_service_1.WorkflowCredentialsService])
], WorkflowCredentialsController);
//# sourceMappingURL=workflow-credentials.controller.js.map