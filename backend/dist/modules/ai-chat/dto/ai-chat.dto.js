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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetConversationsDto = exports.UpdateConversationDto = exports.CreateWorkflowSuggestionDto = exports.SendMessageDto = exports.CreateConversationDto = void 0;
const class_validator_1 = require("class-validator");
class CreateConversationDto {
    title;
    context_type = 'workflow';
    context_data;
}
exports.CreateConversationDto = CreateConversationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateConversationDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['workflow', 'general', 'troubleshooting', 'learning']),
    __metadata("design:type", String)
], CreateConversationDto.prototype, "context_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateConversationDto.prototype, "context_data", void 0);
class SendMessageDto {
    content;
    metadata;
}
exports.SendMessageDto = SendMessageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(10000),
    __metadata("design:type", String)
], SendMessageDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SendMessageDto.prototype, "metadata", void 0);
class CreateWorkflowSuggestionDto {
    title;
    description;
    workflow_definition;
    suggestion_type = 'workflow';
    confidence_score;
}
exports.CreateWorkflowSuggestionDto = CreateWorkflowSuggestionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateWorkflowSuggestionDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateWorkflowSuggestionDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateWorkflowSuggestionDto.prototype, "workflow_definition", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['workflow', 'node', 'optimization', 'fix']),
    __metadata("design:type", String)
], CreateWorkflowSuggestionDto.prototype, "suggestion_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateWorkflowSuggestionDto.prototype, "confidence_score", void 0);
class UpdateConversationDto {
    title;
    status;
}
exports.UpdateConversationDto = UpdateConversationDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdateConversationDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['active', 'archived', 'deleted']),
    __metadata("design:type", String)
], UpdateConversationDto.prototype, "status", void 0);
class GetConversationsDto {
    context_type;
    status;
    limit = 20;
    offset = 0;
}
exports.GetConversationsDto = GetConversationsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['workflow', 'general', 'troubleshooting', 'learning']),
    __metadata("design:type", String)
], GetConversationsDto.prototype, "context_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['active', 'archived', 'deleted']),
    __metadata("design:type", String)
], GetConversationsDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GetConversationsDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GetConversationsDto.prototype, "offset", void 0);
//# sourceMappingURL=ai-chat.dto.js.map