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
exports.VariablesController = void 0;
const common_1 = require("@nestjs/common");
const variables_service_1 = require("./variables.service");
const variables_dto_1 = require("./dto/variables.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const require_workspace_guard_1 = require("../auth/require-workspace.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let VariablesController = class VariablesController {
    variablesService;
    constructor(variablesService) {
        this.variablesService = variablesService;
    }
    createGlobalVariable(createVariableDto, user) {
        return this.variablesService.createGlobalVariable(createVariableDto, user.id);
    }
    getGlobalVariables() {
        return this.variablesService.getGlobalVariables();
    }
    getGlobalVariableById(id) {
        return this.variablesService.getGlobalVariableById(id);
    }
    updateGlobalVariable(id, updateVariableDto, user) {
        return this.variablesService.updateGlobalVariable(id, updateVariableDto, user.id);
    }
    deleteGlobalVariable(id) {
        return this.variablesService.deleteGlobalVariable(id);
    }
    createWorkspaceVariable(createVariableDto, user, req) {
        return this.variablesService.createWorkspaceVariable(req.workspace.id, createVariableDto, user.id);
    }
    getWorkspaceVariables(req) {
        return this.variablesService.getWorkspaceVariables(req.workspace.id);
    }
    getWorkspaceVariableById(id, req) {
        return this.variablesService.getWorkspaceVariableById(req.workspace.id, id);
    }
    updateWorkspaceVariable(id, updateVariableDto, user, req) {
        return this.variablesService.updateWorkspaceVariable(req.workspace.id, id, updateVariableDto, user.id);
    }
    deleteWorkspaceVariable(id, req) {
        return this.variablesService.deleteWorkspaceVariable(req.workspace.id, id);
    }
    getVariableByName(name, req) {
        return this.variablesService.getVariableByName(req.workspace.id, name);
    }
};
exports.VariablesController = VariablesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [variables_dto_1.CreateVariableDto, Object]),
    __metadata("design:returntype", void 0)
], VariablesController.prototype, "createGlobalVariable", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VariablesController.prototype, "getGlobalVariables", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VariablesController.prototype, "getGlobalVariableById", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, variables_dto_1.UpdateVariableDto, Object]),
    __metadata("design:returntype", void 0)
], VariablesController.prototype, "updateGlobalVariable", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VariablesController.prototype, "deleteGlobalVariable", null);
__decorate([
    (0, common_1.Post)('workspace'),
    (0, common_1.UseGuards)(require_workspace_guard_1.RequireWorkspaceGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [variables_dto_1.CreateWorkspaceVariableDto, Object, Object]),
    __metadata("design:returntype", void 0)
], VariablesController.prototype, "createWorkspaceVariable", null);
__decorate([
    (0, common_1.Get)('workspace'),
    (0, common_1.UseGuards)(require_workspace_guard_1.RequireWorkspaceGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VariablesController.prototype, "getWorkspaceVariables", null);
__decorate([
    (0, common_1.Get)('workspace/:id'),
    (0, common_1.UseGuards)(require_workspace_guard_1.RequireWorkspaceGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VariablesController.prototype, "getWorkspaceVariableById", null);
__decorate([
    (0, common_1.Put)('workspace/:id'),
    (0, common_1.UseGuards)(require_workspace_guard_1.RequireWorkspaceGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, variables_dto_1.UpdateWorkspaceVariableDto, Object, Object]),
    __metadata("design:returntype", void 0)
], VariablesController.prototype, "updateWorkspaceVariable", null);
__decorate([
    (0, common_1.Delete)('workspace/:id'),
    (0, common_1.UseGuards)(require_workspace_guard_1.RequireWorkspaceGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VariablesController.prototype, "deleteWorkspaceVariable", null);
__decorate([
    (0, common_1.Get)('search/:name'),
    (0, common_1.UseGuards)(require_workspace_guard_1.RequireWorkspaceGuard),
    __param(0, (0, common_1.Param)('name')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VariablesController.prototype, "getVariableByName", null);
exports.VariablesController = VariablesController = __decorate([
    (0, common_1.Controller)('api/variables'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [variables_service_1.VariablesService])
], VariablesController);
//# sourceMappingURL=variables.controller.js.map