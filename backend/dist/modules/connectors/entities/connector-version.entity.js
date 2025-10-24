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
exports.ConnectorVersion = void 0;
const typeorm_1 = require("typeorm");
let ConnectorVersion = class ConnectorVersion {
    id;
    connectorId;
    version;
    isActive;
    changelog;
    configSchema;
    authSchema;
    created_at;
};
exports.ConnectorVersion = ConnectorVersion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ConnectorVersion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], ConnectorVersion.prototype, "connectorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], ConnectorVersion.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], ConnectorVersion.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ConnectorVersion.prototype, "changelog", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: '{}' }),
    __metadata("design:type", Object)
], ConnectorVersion.prototype, "configSchema", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: '{}' }),
    __metadata("design:type", Object)
], ConnectorVersion.prototype, "authSchema", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ConnectorVersion.prototype, "created_at", void 0);
exports.ConnectorVersion = ConnectorVersion = __decorate([
    (0, typeorm_1.Entity)('connector_versions'),
    (0, typeorm_1.Index)(['connectorId']),
    (0, typeorm_1.Index)(['isActive']),
    (0, typeorm_1.Unique)(['connectorId', 'version'])
], ConnectorVersion);
//# sourceMappingURL=connector-version.entity.js.map