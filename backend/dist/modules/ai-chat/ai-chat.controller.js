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
exports.AiChatController = void 0;
const common_1 = require("@nestjs/common");
const ai_chat_service_1 = require("./ai-chat.service");
const ai_chat_dto_1 = require("./dto/ai-chat.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const require_workspace_guard_1 = require("../auth/require-workspace.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let AiChatController = class AiChatController {
    aiChatService;
    constructor(aiChatService) {
        this.aiChatService = aiChatService;
    }
    createConversation(createConversationDto, user, req) {
        return this.aiChatService.createConversation(req.workspace.id, user.id, createConversationDto);
    }
    getConversations(query, user, req) {
        return this.aiChatService.getConversations(req.workspace.id, user.id, query);
    }
    getConversationById(id, user, req) {
        return this.aiChatService.getConversationById(req.workspace.id, user.id, id);
    }
    updateConversation(id, updateConversationDto, user, req) {
        return this.aiChatService.updateConversation(req.workspace.id, user.id, id, updateConversationDto);
    }
    deleteConversation(id, user, req) {
        return this.aiChatService.deleteConversation(req.workspace.id, user.id, id);
    }
    sendMessage(id, sendMessageDto, user, req) {
        return this.aiChatService.sendMessage(req.workspace.id, user.id, id, sendMessageDto);
    }
    getMessages(id, user, req) {
        return this.aiChatService.getMessages(req.workspace.id, user.id, id);
    }
    createWorkflowSuggestion(id, createSuggestionDto, user, req) {
        return this.aiChatService.createWorkflowSuggestion(req.workspace.id, user.id, id, createSuggestionDto);
    }
    getWorkflowSuggestions(conversationId, user, req) {
        return this.aiChatService.getWorkflowSuggestions(req.workspace.id, user.id, conversationId);
    }
    updateWorkflowSuggestionStatus(id, status, user, req) {
        return this.aiChatService.updateWorkflowSuggestionStatus(req.workspace.id, user.id, id, status);
    }
    getWorkspaceAISettings(req) {
        return this.aiChatService.getWorkspaceAISettings(req.workspace.id);
    }
    updateWorkspaceAISettings(settings, req) {
        return this.aiChatService.updateWorkspaceAISettings(req.workspace.id, settings);
    }
};
exports.AiChatController = AiChatController;
__decorate([
    (0, common_1.Post)('conversations'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_chat_dto_1.CreateConversationDto, Object, Object]),
    __metadata("design:returntype", void 0)
], AiChatController.prototype, "createConversation", null);
__decorate([
    (0, common_1.Get)('conversations'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ai_chat_dto_1.GetConversationsDto, Object, Object]),
    __metadata("design:returntype", void 0)
], AiChatController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Get)('conversations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AiChatController.prototype, "getConversationById", null);
__decorate([
    (0, common_1.Put)('conversations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ai_chat_dto_1.UpdateConversationDto, Object, Object]),
    __metadata("design:returntype", void 0)
], AiChatController.prototype, "updateConversation", null);
__decorate([
    (0, common_1.Delete)('conversations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AiChatController.prototype, "deleteConversation", null);
__decorate([
    (0, common_1.Post)('conversations/:id/messages'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ai_chat_dto_1.SendMessageDto, Object, Object]),
    __metadata("design:returntype", void 0)
], AiChatController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)('conversations/:id/messages'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AiChatController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)('conversations/:id/suggestions'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ai_chat_dto_1.CreateWorkflowSuggestionDto, Object, Object]),
    __metadata("design:returntype", void 0)
], AiChatController.prototype, "createWorkflowSuggestion", null);
__decorate([
    (0, common_1.Get)('suggestions'),
    __param(0, (0, common_1.Query)('conversation_id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], AiChatController.prototype, "getWorkflowSuggestions", null);
__decorate([
    (0, common_1.Put)('suggestions/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], AiChatController.prototype, "updateWorkflowSuggestionStatus", null);
__decorate([
    (0, common_1.Get)('settings'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AiChatController.prototype, "getWorkspaceAISettings", null);
__decorate([
    (0, common_1.Put)('settings'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AiChatController.prototype, "updateWorkspaceAISettings", null);
exports.AiChatController = AiChatController = __decorate([
    (0, common_1.Controller)('api/ai-chat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, require_workspace_guard_1.RequireWorkspaceGuard),
    __metadata("design:paramtypes", [ai_chat_service_1.AiChatService])
], AiChatController);
//# sourceMappingURL=ai-chat.controller.js.map