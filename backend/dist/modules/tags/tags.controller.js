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
exports.TagsController = void 0;
const common_1 = require("@nestjs/common");
const tags_service_1 = require("./tags.service");
const tags_dto_1 = require("./dto/tags.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const require_workspace_guard_1 = require("../auth/require-workspace.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let TagsController = class TagsController {
    tagsService;
    constructor(tagsService) {
        this.tagsService = tagsService;
    }
    createTagCategory(createTagCategoryDto) {
        return this.tagsService.createTagCategory(createTagCategoryDto);
    }
    getTagCategories() {
        return this.tagsService.getTagCategories();
    }
    getTagCategoryById(id) {
        return this.tagsService.getTagCategoryById(id);
    }
    updateTagCategory(id, updateTagCategoryDto) {
        return this.tagsService.updateTagCategory(id, updateTagCategoryDto);
    }
    deleteTagCategory(id) {
        return this.tagsService.deleteTagCategory(id);
    }
    createTag(createTagDto, user, req) {
        return this.tagsService.createTag(req.workspace.id, createTagDto, user.id);
    }
    getTags(req) {
        return this.tagsService.getTags(req.workspace.id);
    }
    getTagById(id, req) {
        return this.tagsService.getTagById(req.workspace.id, id);
    }
    updateTag(id, updateTagDto, user, req) {
        return this.tagsService.updateTag(req.workspace.id, id, updateTagDto, user.id);
    }
    deleteTag(id, req) {
        return this.tagsService.deleteTag(req.workspace.id, id);
    }
    assignTagsToWorkflow(workflowId, assignTagsDto, req) {
        return this.tagsService.assignTagsToWorkflow(req.workspace.id, workflowId, assignTagsDto);
    }
    getWorkflowTags(workflowId, req) {
        return this.tagsService.getWorkflowTags(req.workspace.id, workflowId);
    }
    getTagsByCategory(categoryId, req) {
        return this.tagsService.getTagsByCategory(req.workspace.id, categoryId);
    }
};
exports.TagsController = TagsController;
__decorate([
    (0, common_1.Post)('categories'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tags_dto_1.CreateTagCategoryDto]),
    __metadata("design:returntype", void 0)
], TagsController.prototype, "createTagCategory", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TagsController.prototype, "getTagCategories", null);
__decorate([
    (0, common_1.Get)('categories/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TagsController.prototype, "getTagCategoryById", null);
__decorate([
    (0, common_1.Put)('categories/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, tags_dto_1.UpdateTagCategoryDto]),
    __metadata("design:returntype", void 0)
], TagsController.prototype, "updateTagCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TagsController.prototype, "deleteTagCategory", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(require_workspace_guard_1.RequireWorkspaceGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tags_dto_1.CreateTagDto, Object, Object]),
    __metadata("design:returntype", void 0)
], TagsController.prototype, "createTag", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(require_workspace_guard_1.RequireWorkspaceGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TagsController.prototype, "getTags", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(require_workspace_guard_1.RequireWorkspaceGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TagsController.prototype, "getTagById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(require_workspace_guard_1.RequireWorkspaceGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, tags_dto_1.UpdateTagDto, Object, Object]),
    __metadata("design:returntype", void 0)
], TagsController.prototype, "updateTag", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(require_workspace_guard_1.RequireWorkspaceGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TagsController.prototype, "deleteTag", null);
__decorate([
    (0, common_1.Post)('workflows/:workflowId/assign'),
    (0, common_1.UseGuards)(require_workspace_guard_1.RequireWorkspaceGuard),
    __param(0, (0, common_1.Param)('workflowId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, tags_dto_1.AssignTagsToWorkflowDto, Object]),
    __metadata("design:returntype", void 0)
], TagsController.prototype, "assignTagsToWorkflow", null);
__decorate([
    (0, common_1.Get)('workflows/:workflowId'),
    (0, common_1.UseGuards)(require_workspace_guard_1.RequireWorkspaceGuard),
    __param(0, (0, common_1.Param)('workflowId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TagsController.prototype, "getWorkflowTags", null);
__decorate([
    (0, common_1.Get)('categories/:categoryId/tags'),
    (0, common_1.UseGuards)(require_workspace_guard_1.RequireWorkspaceGuard),
    __param(0, (0, common_1.Param)('categoryId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TagsController.prototype, "getTagsByCategory", null);
exports.TagsController = TagsController = __decorate([
    (0, common_1.Controller)('api/tags'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [tags_service_1.TagsService])
], TagsController);
//# sourceMappingURL=tags.controller.js.map