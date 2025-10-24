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
exports.DistributedLock = void 0;
const typeorm_1 = require("typeorm");
let DistributedLock = class DistributedLock {
    id;
    lockKey;
    lockedBy;
    lockedAt;
    expiresAt;
};
exports.DistributedLock = DistributedLock;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DistributedLock.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, unique: true }),
    __metadata("design:type", String)
], DistributedLock.prototype, "lockKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], DistributedLock.prototype, "lockedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], DistributedLock.prototype, "lockedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], DistributedLock.prototype, "expiresAt", void 0);
exports.DistributedLock = DistributedLock = __decorate([
    (0, typeorm_1.Entity)('distributed_locks'),
    (0, typeorm_1.Index)(['expiresAt']),
    (0, typeorm_1.Unique)(['lockKey'])
], DistributedLock);
//# sourceMappingURL=distributed-lock.entity.js.map