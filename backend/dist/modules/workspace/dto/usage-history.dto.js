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
exports.UsageHistoryQueryDto = exports.UsagePeriod = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var UsagePeriod;
(function (UsagePeriod) {
    UsagePeriod["DAY"] = "1d";
    UsagePeriod["WEEK"] = "7d";
    UsagePeriod["MONTH"] = "30d";
    UsagePeriod["QUARTER"] = "90d";
    UsagePeriod["YEAR"] = "365d";
})(UsagePeriod || (exports.UsagePeriod = UsagePeriod = {}));
class UsageHistoryQueryDto {
    period = UsagePeriod.MONTH;
    startDate;
    endDate;
    metric;
}
exports.UsageHistoryQueryDto = UsageHistoryQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(UsagePeriod),
    (0, class_transformer_1.Transform)(({ value }) => value || UsagePeriod.MONTH),
    __metadata("design:type", String)
], UsageHistoryQueryDto.prototype, "period", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UsageHistoryQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UsageHistoryQueryDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UsageHistoryQueryDto.prototype, "metric", void 0);
//# sourceMappingURL=usage-history.dto.js.map