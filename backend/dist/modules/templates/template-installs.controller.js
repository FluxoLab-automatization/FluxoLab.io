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
exports.TemplateInstallsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../shared/guards/jwt-auth.guard");
const template_installs_service_1 = require("./template-installs.service");
let TemplateInstallsController = class TemplateInstallsController {
    templateInstallsService;
    constructor(templateInstallsService) {
        this.templateInstallsService = templateInstallsService;
    }
    async getTemplateInstalls(workspaceId, templateId, status) {
        return this.templateInstallsService.getTemplateInstalls(workspaceId, { templateId, status });
    }
    async getTemplateInstall(id) {
        return this.templateInstallsService.getTemplateInstall(id);
    }
    async createTemplateInstall(createTemplateInstallDto) {
        return this.templateInstallsService.createTemplateInstall(createTemplateInstallDto);
    }
    async updateTemplateInstall(id, updateTemplateInstallDto) {
        return this.templateInstallsService.updateTemplateInstall(id, updateTemplateInstallDto);
    }
    async deleteTemplateInstall(id) {
        return this.templateInstallsService.deleteTemplateInstall(id);
    }
};
exports.TemplateInstallsController = TemplateInstallsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('workspaceId')),
    __param(1, (0, common_1.Query)('templateId')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TemplateInstallsController.prototype, "getTemplateInstalls", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplateInstallsController.prototype, "getTemplateInstall", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TemplateInstallsController.prototype, "createTemplateInstall", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TemplateInstallsController.prototype, "updateTemplateInstall", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplateInstallsController.prototype, "deleteTemplateInstall", null);
exports.TemplateInstallsController = TemplateInstallsController = __decorate([
    (0, common_1.Controller)('api/template-installs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [template_installs_service_1.TemplateInstallsService])
], TemplateInstallsController);
//# sourceMappingURL=template-installs.controller.js.map