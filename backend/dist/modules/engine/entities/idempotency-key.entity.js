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
exports.IdempotencyKey = void 0;
const typeorm_1 = require("typeorm");
let IdempotencyKey = class IdempotencyKey {
    id;
    tenantId;
    workspaceId;
    scope;
    key;
    runId;
    expiresAt;
    created_at;
};
exports.IdempotencyKey = IdempotencyKey;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], IdempotencyKey.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], IdempotencyKey.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], IdempotencyKey.prototype, "workspaceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], IdempotencyKey.prototype, "scope", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], IdempotencyKey.prototype, "key", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], IdempotencyKey.prototype, "runId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], IdempotencyKey.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], IdempotencyKey.prototype, "created_at", void 0);
exports.IdempotencyKey = IdempotencyKey = __decorate([
    (0, typeorm_1.Entity)('idempotency_keys'),
    (0, typeorm_1.Index)(['scope']),
    (0, typeorm_1.Index)(['expiresAt']),
    (0, typeorm_1.Index)(['workspaceId']),
    (0, typeorm_1.Unique)(['tenantId', 'workspaceId', 'scope', 'key'])
], IdempotencyKey);
//# sourceMappingURL=idempotency-key.entity.js.map