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
exports.Workflow = void 0;
const typeorm_1 = require("typeorm");
const execution_entity_1 = require("./execution.entity");
const workflow_version_entity_1 = require("./workflow-version.entity");
let Workflow = class Workflow {
    id;
    name;
    description;
    workspaceId;
    tenantId;
    isActive;
    isPublic;
    tags;
    metadata;
    activeVersionId;
    executions;
    versions;
    activeVersion;
    createdAt;
    updatedAt;
};
exports.Workflow = Workflow;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Workflow.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Workflow.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Workflow.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Workflow.prototype, "workspaceId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Workflow.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Workflow.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Workflow.prototype, "isPublic", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Array)
], Workflow.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], Workflow.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Workflow.prototype, "activeVersionId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => execution_entity_1.Execution, execution => execution.workflow),
    __metadata("design:type", Array)
], Workflow.prototype, "executions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => workflow_version_entity_1.WorkflowVersion, version => version.workflow),
    __metadata("design:type", Array)
], Workflow.prototype, "versions", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => workflow_version_entity_1.WorkflowVersion, version => version.id),
    (0, typeorm_1.JoinColumn)({ name: 'activeVersionId' }),
    __metadata("design:type", workflow_version_entity_1.WorkflowVersion)
], Workflow.prototype, "activeVersion", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Workflow.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Workflow.prototype, "updatedAt", void 0);
exports.Workflow = Workflow = __decorate([
    (0, typeorm_1.Entity)('workflows')
], Workflow);
//# sourceMappingURL=workflow.entity.js.map