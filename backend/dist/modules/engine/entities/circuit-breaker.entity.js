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
exports.CircuitBreaker = void 0;
const typeorm_1 = require("typeorm");
let CircuitBreaker = class CircuitBreaker {
    id;
    name;
    serviceName;
    workspaceId;
    tenantId;
    state;
    failureCount;
    failureThreshold;
    timeout;
    lastFailureTime;
    nextAttemptTime;
    createdAt;
    updatedAt;
};
exports.CircuitBreaker = CircuitBreaker;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CircuitBreaker.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CircuitBreaker.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CircuitBreaker.prototype, "serviceName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CircuitBreaker.prototype, "workspaceId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CircuitBreaker.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'closed' }),
    __metadata("design:type", String)
], CircuitBreaker.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], CircuitBreaker.prototype, "failureCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 5 }),
    __metadata("design:type", Number)
], CircuitBreaker.prototype, "failureThreshold", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 60000 }),
    __metadata("design:type", Number)
], CircuitBreaker.prototype, "timeout", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], CircuitBreaker.prototype, "lastFailureTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], CircuitBreaker.prototype, "nextAttemptTime", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CircuitBreaker.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CircuitBreaker.prototype, "updatedAt", void 0);
exports.CircuitBreaker = CircuitBreaker = __decorate([
    (0, typeorm_1.Entity)('circuit_breakers')
], CircuitBreaker);
//# sourceMappingURL=circuit-breaker.entity.js.map