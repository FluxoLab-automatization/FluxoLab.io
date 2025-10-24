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
exports.ExecutionMetric = void 0;
const typeorm_1 = require("typeorm");
let ExecutionMetric = class ExecutionMetric {
    id;
    workspaceId;
    tenantId;
    workflowId;
    runId;
    metricType;
    value;
    unit;
    metadata;
    createdAt;
};
exports.ExecutionMetric = ExecutionMetric;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ExecutionMetric.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ExecutionMetric.prototype, "workspaceId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ExecutionMetric.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ExecutionMetric.prototype, "workflowId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ExecutionMetric.prototype, "runId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ExecutionMetric.prototype, "metricType", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], ExecutionMetric.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ExecutionMetric.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], ExecutionMetric.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ExecutionMetric.prototype, "createdAt", void 0);
exports.ExecutionMetric = ExecutionMetric = __decorate([
    (0, typeorm_1.Entity)('execution_metrics'),
    (0, typeorm_1.Index)(['workspaceId', 'tenantId', 'createdAt']),
    (0, typeorm_1.Index)(['workflowId', 'createdAt'])
], ExecutionMetric);
//# sourceMappingURL=execution-metric.entity.js.map