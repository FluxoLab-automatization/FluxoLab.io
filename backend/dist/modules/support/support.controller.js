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
exports.SupportController = void 0;
const common_1 = require("@nestjs/common");
const support_service_1 = require("./support.service");
const support_dto_1 = require("./dto/support.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const require_workspace_guard_1 = require("../auth/require-workspace.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let SupportController = class SupportController {
    supportService;
    constructor(supportService) {
        this.supportService = supportService;
    }
    createTicket(createTicketDto, user, req) {
        return this.supportService.createTicket(req.workspace.id, user.id, createTicketDto);
    }
    getTickets(query, user, req) {
        return this.supportService.getTickets(req.workspace.id, user.id, query);
    }
    getTicketById(id, user, req) {
        return this.supportService.getTicketById(req.workspace.id, user.id, id);
    }
    updateTicket(id, updateTicketDto, user, req) {
        return this.supportService.updateTicket(req.workspace.id, user.id, id, updateTicketDto);
    }
    deleteTicket(id, user, req) {
        return this.supportService.deleteTicket(req.workspace.id, user.id, id);
    }
    createTicketMessage(id, createMessageDto, user, req) {
        return this.supportService.createTicketMessage(req.workspace.id, user.id, id, createMessageDto);
    }
    getTicketMessages(id, user, req) {
        return this.supportService.getTicketMessages(req.workspace.id, user.id, id);
    }
    updateTicketMessage(id, updateMessageDto, user, req) {
        return this.supportService.updateTicketMessage(req.workspace.id, user.id, id, updateMessageDto);
    }
    deleteTicketMessage(id, user, req) {
        return this.supportService.deleteTicketMessage(req.workspace.id, user.id, id);
    }
    createTicketRating(id, createRatingDto, user, req) {
        return this.supportService.createTicketRating(req.workspace.id, user.id, id, createRatingDto);
    }
    getTicketRatings(id, req) {
        return this.supportService.getTicketRatings(req.workspace.id, id);
    }
    createCategory(createCategoryDto) {
        return this.supportService.createCategory(createCategoryDto);
    }
    getCategories() {
        return this.supportService.getCategories();
    }
    updateCategory(id, updateCategoryDto) {
        return this.supportService.updateCategory(id, updateCategoryDto);
    }
    deleteCategory(id) {
        return this.supportService.deleteCategory(id);
    }
    createPriority(createPriorityDto) {
        return this.supportService.createPriority(createPriorityDto);
    }
    getPriorities() {
        return this.supportService.getPriorities();
    }
    updatePriority(id, updatePriorityDto) {
        return this.supportService.updatePriority(id, updatePriorityDto);
    }
    deletePriority(id) {
        return this.supportService.deletePriority(id);
    }
    getStatuses() {
        return this.supportService.getStatuses();
    }
};
exports.SupportController = SupportController;
__decorate([
    (0, common_1.Post)('tickets'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [support_dto_1.CreateTicketDto, Object, Object]),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "createTicket", null);
__decorate([
    (0, common_1.Get)('tickets'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [support_dto_1.GetTicketsDto, Object, Object]),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "getTickets", null);
__decorate([
    (0, common_1.Get)('tickets/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "getTicketById", null);
__decorate([
    (0, common_1.Put)('tickets/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, support_dto_1.UpdateTicketDto, Object, Object]),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "updateTicket", null);
__decorate([
    (0, common_1.Delete)('tickets/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "deleteTicket", null);
__decorate([
    (0, common_1.Post)('tickets/:id/messages'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, support_dto_1.CreateTicketMessageDto, Object, Object]),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "createTicketMessage", null);
__decorate([
    (0, common_1.Get)('tickets/:id/messages'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "getTicketMessages", null);
__decorate([
    (0, common_1.Put)('messages/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, support_dto_1.UpdateTicketMessageDto, Object, Object]),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "updateTicketMessage", null);
__decorate([
    (0, common_1.Delete)('messages/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "deleteTicketMessage", null);
__decorate([
    (0, common_1.Post)('tickets/:id/ratings'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, support_dto_1.CreateTicketRatingDto, Object, Object]),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "createTicketRating", null);
__decorate([
    (0, common_1.Get)('tickets/:id/ratings'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "getTicketRatings", null);
__decorate([
    (0, common_1.Post)('categories'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [support_dto_1.CreateCategoryDto]),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Put)('categories/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, support_dto_1.UpdateCategoryDto]),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Post)('priorities'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [support_dto_1.CreatePriorityDto]),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "createPriority", null);
__decorate([
    (0, common_1.Get)('priorities'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "getPriorities", null);
__decorate([
    (0, common_1.Put)('priorities/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, support_dto_1.UpdatePriorityDto]),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "updatePriority", null);
__decorate([
    (0, common_1.Delete)('priorities/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "deletePriority", null);
__decorate([
    (0, common_1.Get)('statuses'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SupportController.prototype, "getStatuses", null);
exports.SupportController = SupportController = __decorate([
    (0, common_1.Controller)('api/support'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    __metadata("design:paramtypes", [support_service_1.SupportService])
], SupportController);
//# sourceMappingURL=support.controller.js.map