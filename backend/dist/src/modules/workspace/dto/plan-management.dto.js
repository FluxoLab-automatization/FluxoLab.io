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
exports.CancelSubscriptionDto = exports.UpgradePlanDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const BILLING_INTERVALS = ['month', 'year'];
class UpgradePlanDto {
    planCode;
    billingInterval = 'month';
    immediate = true;
}
exports.UpgradePlanDto = UpgradePlanDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpgradePlanDto.prototype, "planCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(BILLING_INTERVALS),
    (0, class_transformer_1.Expose)({ name: 'billing_interval' }),
    __metadata("design:type", String)
], UpgradePlanDto.prototype, "billingInterval", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpgradePlanDto.prototype, "immediate", void 0);
class CancelSubscriptionDto {
    reason;
    immediate = false;
}
exports.CancelSubscriptionDto = CancelSubscriptionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CancelSubscriptionDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CancelSubscriptionDto.prototype, "immediate", void 0);
//# sourceMappingURL=plan-management.dto.js.map