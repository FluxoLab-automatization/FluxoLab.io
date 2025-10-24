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
exports.SystemEvent = void 0;
const typeorm_1 = require("typeorm");
let SystemEvent = class SystemEvent {
    id;
    eventType;
    tenantId;
    workspaceId;
    runId;
    correlationId;
    traceId;
    spanId;
    payload;
    checksum;
    created_at;
};
exports.SystemEvent = SystemEvent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SystemEvent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], SystemEvent.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], SystemEvent.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], SystemEvent.prototype, "workspaceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], SystemEvent.prototype, "runId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], SystemEvent.prototype, "correlationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], SystemEvent.prototype, "traceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], SystemEvent.prototype, "spanId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: '{}' }),
    __metadata("design:type", Object)
], SystemEvent.prototype, "payload", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64 }),
    __metadata("design:type", String)
], SystemEvent.prototype, "checksum", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SystemEvent.prototype, "created_at", void 0);
exports.SystemEvent = SystemEvent = __decorate([
    (0, typeorm_1.Entity)('system_events'),
    (0, typeorm_1.Index)(['eventType']),
    (0, typeorm_1.Index)(['tenantId']),
    (0, typeorm_1.Index)(['workspaceId']),
    (0, typeorm_1.Index)(['runId']),
    (0, typeorm_1.Index)(['correlationId']),
    (0, typeorm_1.Index)(['traceId']),
    (0, typeorm_1.Index)(['created_at'])
], SystemEvent);
//# sourceMappingURL=system-event.entity.js.map