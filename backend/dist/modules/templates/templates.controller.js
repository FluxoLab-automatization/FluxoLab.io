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
exports.TemplatesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../shared/guards/jwt-auth.guard");
const templates_service_1 = require("./templates.service");
let TemplatesController = class TemplatesController {
    templatesService;
    constructor(templatesService) {
        this.templatesService = templatesService;
    }
    async getTemplates(workspaceId, category, status) {
        return this.templatesService.getTemplates(workspaceId, { category, status });
    }
    async getTemplate(id) {
        return this.templatesService.getTemplate(id);
    }
    async createTemplate(createTemplateDto) {
        return this.templatesService.createTemplate(createTemplateDto);
    }
    async updateTemplate(id, updateTemplateDto) {
        return this.templatesService.updateTemplate(id, updateTemplateDto);
    }
    async deleteTemplate(id) {
        return this.templatesService.deleteTemplate(id);
    }
    async installTemplate(id, installData) {
        return this.templatesService.installTemplate(id, installData);
    }
};
exports.TemplatesController = TemplatesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('workspaceId')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "getTemplate", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "createTemplate", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "updateTemplate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "deleteTemplate", null);
__decorate([
    (0, common_1.Post)(':id/install'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "installTemplate", null);
exports.TemplatesController = TemplatesController = __decorate([
    (0, common_1.Controller)('api/templates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [templates_service_1.TemplatesService])
], TemplatesController);
//# sourceMappingURL=templates.controller.js.map