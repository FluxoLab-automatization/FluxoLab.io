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
exports.CreateWorkflowDto = exports.WorkflowDefinitionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class WorkflowNodePositionDto {
    x;
    y;
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WorkflowNodePositionDto.prototype, "x", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WorkflowNodePositionDto.prototype, "y", void 0);
class WorkflowNodePortDto {
    id;
    kind;
    label;
    alignment;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowNodePortDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['input', 'output']),
    __metadata("design:type", String)
], WorkflowNodePortDto.prototype, "kind", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowNodePortDto.prototype, "label", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['left', 'right', 'top', 'bottom']),
    __metadata("design:type", String)
], WorkflowNodePortDto.prototype, "alignment", void 0);
class WorkflowNodeStyleDto {
    icon;
    accent;
    variant;
    status;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowNodeStyleDto.prototype, "icon", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowNodeStyleDto.prototype, "accent", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['default', 'success', 'warning', 'info']),
    __metadata("design:type", String)
], WorkflowNodeStyleDto.prototype, "variant", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['ready', 'inactive', 'error']),
    __metadata("design:type", String)
], WorkflowNodeStyleDto.prototype, "status", void 0);
class WorkflowNodeDto {
    id;
    type;
    name;
    params;
    position;
    ports;
    style;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowNodeDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowNodeDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowNodeDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], WorkflowNodeDto.prototype, "params", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => WorkflowNodePositionDto),
    __metadata("design:type", WorkflowNodePositionDto)
], WorkflowNodeDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WorkflowNodePortDto),
    __metadata("design:type", Array)
], WorkflowNodeDto.prototype, "ports", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => WorkflowNodeStyleDto),
    __metadata("design:type", WorkflowNodeStyleDto)
], WorkflowNodeDto.prototype, "style", void 0);
class WorkflowConnectionDto {
    id;
    from;
    to;
    output;
    label;
    variant;
    fromPort;
    toPort;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowConnectionDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowConnectionDto.prototype, "from", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowConnectionDto.prototype, "to", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowConnectionDto.prototype, "output", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowConnectionDto.prototype, "label", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['solid', 'dashed']),
    __metadata("design:type", String)
], WorkflowConnectionDto.prototype, "variant", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowConnectionDto.prototype, "fromPort", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WorkflowConnectionDto.prototype, "toPort", void 0);
class WorkflowDefinitionDto {
    nodes;
    connections;
}
exports.WorkflowDefinitionDto = WorkflowDefinitionDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WorkflowNodeDto),
    __metadata("design:type", Array)
], WorkflowDefinitionDto.prototype, "nodes", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => WorkflowConnectionDto),
    __metadata("design:type", Array)
], WorkflowDefinitionDto.prototype, "connections", void 0);
class CreateWorkflowDto {
    name;
    definition;
    tags;
}
exports.CreateWorkflowDto = CreateWorkflowDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWorkflowDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => WorkflowDefinitionDto),
    __metadata("design:type", WorkflowDefinitionDto)
], CreateWorkflowDto.prototype, "definition", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateWorkflowDto.prototype, "tags", void 0);
//# sourceMappingURL=create-workflow.dto.js.map