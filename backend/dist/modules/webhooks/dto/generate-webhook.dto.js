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
exports.GenerateWebhookDto = void 0;
const class_validator_1 = require("class-validator");
class GenerateWebhookDto {
    workspaceId;
    workflowId;
    userId;
    path;
    method;
    respondMode;
    description;
}
exports.GenerateWebhookDto = GenerateWebhookDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GenerateWebhookDto.prototype, "workspaceId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GenerateWebhookDto.prototype, "workflowId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], GenerateWebhookDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], GenerateWebhookDto.prototype, "path", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['GET', 'POST']),
    __metadata("design:type", String)
], GenerateWebhookDto.prototype, "method", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['immediate', 'on_last_node', 'via_node']),
    __metadata("design:type", String)
], GenerateWebhookDto.prototype, "respondMode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(240),
    __metadata("design:type", String)
], GenerateWebhookDto.prototype, "description", void 0);
//# sourceMappingURL=generate-webhook.dto.js.map