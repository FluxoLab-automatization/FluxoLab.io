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
exports.UpdateWorkspaceVariableDto = exports.CreateWorkspaceVariableDto = exports.UpdateVariableDto = exports.CreateVariableDto = void 0;
const class_validator_1 = require("class-validator");
class CreateVariableDto {
    name;
    description;
    value;
    type = 'string';
    is_encrypted = false;
}
exports.CreateVariableDto = CreateVariableDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateVariableDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateVariableDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateVariableDto.prototype, "value", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['string', 'number', 'boolean', 'json', 'secret']),
    __metadata("design:type", String)
], CreateVariableDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateVariableDto.prototype, "is_encrypted", void 0);
class UpdateVariableDto {
    description;
    value;
    type;
    is_encrypted;
}
exports.UpdateVariableDto = UpdateVariableDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateVariableDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVariableDto.prototype, "value", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['string', 'number', 'boolean', 'json', 'secret']),
    __metadata("design:type", String)
], UpdateVariableDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateVariableDto.prototype, "is_encrypted", void 0);
class CreateWorkspaceVariableDto extends CreateVariableDto {
}
exports.CreateWorkspaceVariableDto = CreateWorkspaceVariableDto;
class UpdateWorkspaceVariableDto extends UpdateVariableDto {
}
exports.UpdateWorkspaceVariableDto = UpdateWorkspaceVariableDto;
//# sourceMappingURL=variables.dto.js.map