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
exports.ExecutionStep = void 0;
const typeorm_1 = require("typeorm");
const execution_entity_1 = require("./execution.entity");
let ExecutionStep = class ExecutionStep {
    id;
    executionId;
    nodeId;
    nodeName;
    nodeType;
    status;
    inputItems;
    outputItems;
    startedAt;
    finishedAt;
    errorMessage;
    metadata;
    execution;
    createdAt;
    updatedAt;
};
exports.ExecutionStep = ExecutionStep;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ExecutionStep.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ExecutionStep.prototype, "executionId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ExecutionStep.prototype, "nodeId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ExecutionStep.prototype, "nodeName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ExecutionStep.prototype, "nodeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'pending' }),
    __metadata("design:type", String)
], ExecutionStep.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], ExecutionStep.prototype, "inputItems", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], ExecutionStep.prototype, "outputItems", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], ExecutionStep.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], ExecutionStep.prototype, "finishedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ExecutionStep.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], ExecutionStep.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => execution_entity_1.Execution, execution => execution.steps),
    (0, typeorm_1.JoinColumn)({ name: 'executionId' }),
    __metadata("design:type", execution_entity_1.Execution)
], ExecutionStep.prototype, "execution", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ExecutionStep.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ExecutionStep.prototype, "updatedAt", void 0);
exports.ExecutionStep = ExecutionStep = __decorate([
    (0, typeorm_1.Entity)('execution_steps')
], ExecutionStep);
//# sourceMappingURL=execution-step.entity.js.map