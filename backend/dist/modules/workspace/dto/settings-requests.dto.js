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
exports.CreateApiKeyDto = exports.UpdateSecuritySettingsDto = exports.UpdateProfileDto = exports.ConfigureLogDestinationDto = exports.ConfigureLdapDto = exports.ConfigureSsoDto = exports.UpdateEnvironmentStatusDto = exports.CreateUsageAlertDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const USAGE_ALERT_METRICS = ['webhooks', 'users', 'workflows'];
const USAGE_ALERT_CONDITIONS = ['greater_than', 'less_than', 'equals'];
const ALERT_CHANNELS = ['email', 'slack', 'webhook', 'sms'];
const ENVIRONMENT_STATUSES = ['active', 'inactive'];
const SSO_PROVIDERS = ['google', 'microsoft', 'okta', 'auth0'];
const LOG_DESTINATIONS = ['elasticsearch', 'splunk', 'datadog', 'custom'];
class CreateUsageAlertDto {
    metric;
    threshold;
    condition;
    window;
    channel;
    enabled;
    metadata;
}
exports.CreateUsageAlertDto = CreateUsageAlertDto;
__decorate([
    (0, class_validator_1.IsIn)(USAGE_ALERT_METRICS),
    __metadata("design:type", Object)
], CreateUsageAlertDto.prototype, "metric", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateUsageAlertDto.prototype, "threshold", void 0);
__decorate([
    (0, class_validator_1.IsIn)(USAGE_ALERT_CONDITIONS),
    __metadata("design:type", Object)
], CreateUsageAlertDto.prototype, "condition", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUsageAlertDto.prototype, "window", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(ALERT_CHANNELS),
    __metadata("design:type", Object)
], CreateUsageAlertDto.prototype, "channel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateUsageAlertDto.prototype, "enabled", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateUsageAlertDto.prototype, "metadata", void 0);
class UpdateEnvironmentStatusDto {
    status;
}
exports.UpdateEnvironmentStatusDto = UpdateEnvironmentStatusDto;
__decorate([
    (0, class_validator_1.IsIn)(ENVIRONMENT_STATUSES),
    __metadata("design:type", Object)
], UpdateEnvironmentStatusDto.prototype, "status", void 0);
class ConfigureSsoDto {
    provider;
    clientId;
    clientSecret;
    enabled;
}
exports.ConfigureSsoDto = ConfigureSsoDto;
__decorate([
    (0, class_validator_1.IsIn)(SSO_PROVIDERS),
    __metadata("design:type", Object)
], ConfigureSsoDto.prototype, "provider", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigureSsoDto.prototype, "clientId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigureSsoDto.prototype, "clientSecret", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ConfigureSsoDto.prototype, "enabled", void 0);
class ConfigureLdapDto {
    host;
    port;
    baseDn;
    bindDn;
    bindPassword;
    enabled;
}
exports.ConfigureLdapDto = ConfigureLdapDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigureLdapDto.prototype, "host", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ConfigureLdapDto.prototype, "port", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigureLdapDto.prototype, "baseDn", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigureLdapDto.prototype, "bindDn", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigureLdapDto.prototype, "bindPassword", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ConfigureLdapDto.prototype, "enabled", void 0);
class ConfigureLogDestinationDto {
    destination;
    endpoint;
    apiKey;
    enabled;
}
exports.ConfigureLogDestinationDto = ConfigureLogDestinationDto;
__decorate([
    (0, class_validator_1.IsIn)(LOG_DESTINATIONS),
    __metadata("design:type", Object)
], ConfigureLogDestinationDto.prototype, "destination", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigureLogDestinationDto.prototype, "endpoint", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfigureLogDestinationDto.prototype, "apiKey", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ConfigureLogDestinationDto.prototype, "enabled", void 0);
class UpdateProfileDto {
    displayName;
    email;
    avatar;
    timezone;
    language;
}
exports.UpdateProfileDto = UpdateProfileDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "displayName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "avatar", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "timezone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProfileDto.prototype, "language", void 0);
class UpdateSecuritySettingsDto {
    twoFactorEnabled;
    recoveryEmail;
    phoneNumber;
}
exports.UpdateSecuritySettingsDto = UpdateSecuritySettingsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSecuritySettingsDto.prototype, "twoFactorEnabled", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSecuritySettingsDto.prototype, "recoveryEmail", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSecuritySettingsDto.prototype, "phoneNumber", void 0);
class CreateApiKeyDto {
    label;
    scopes;
    expiresAt;
    metadata;
}
exports.CreateApiKeyDto = CreateApiKeyDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateApiKeyDto.prototype, "label", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateApiKeyDto.prototype, "scopes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateApiKeyDto.prototype, "expiresAt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateApiKeyDto.prototype, "metadata", void 0);
//# sourceMappingURL=settings-requests.dto.js.map