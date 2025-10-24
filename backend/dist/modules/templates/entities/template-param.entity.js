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
exports.TemplateParam = void 0;
const typeorm_1 = require("typeorm");
const template_version_entity_1 = require("./template-version.entity");
let TemplateParam = class TemplateParam {
    id;
    templateVersionId;
    templateId;
    name;
    type;
    isRequired;
    defaultValue;
    description;
    displayOrder;
    validation;
    templateVersion;
    createdAt;
    updatedAt;
};
exports.TemplateParam = TemplateParam;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TemplateParam.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TemplateParam.prototype, "templateVersionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TemplateParam.prototype, "templateId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TemplateParam.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TemplateParam.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], TemplateParam.prototype, "isRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TemplateParam.prototype, "defaultValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TemplateParam.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], TemplateParam.prototype, "displayOrder", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], TemplateParam.prototype, "validation", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => template_version_entity_1.TemplateVersion, version => version.params),
    (0, typeorm_1.JoinColumn)({ name: 'templateVersionId' }),
    __metadata("design:type", template_version_entity_1.TemplateVersion)
], TemplateParam.prototype, "templateVersion", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TemplateParam.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TemplateParam.prototype, "updatedAt", void 0);
exports.TemplateParam = TemplateParam = __decorate([
    (0, typeorm_1.Entity)('template_params')
], TemplateParam);
//# sourceMappingURL=template-param.entity.js.map