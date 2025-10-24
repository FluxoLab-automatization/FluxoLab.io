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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const password_reset_service_1 = require("./password-reset.service");
const password_reset_dto_1 = require("./dto/password-reset.dto");
let PasswordResetController = class PasswordResetController {
    passwordResetService;
    constructor(passwordResetService) {
        this.passwordResetService = passwordResetService;
    }
    async forgotPassword(forgotPasswordDto, req) {
        const ipAddress = req.ip;
        const userAgent = req.get('User-Agent');
        await this.passwordResetService.requestPasswordReset(forgotPasswordDto.identifier, ipAddress, userAgent);
        return {
            message: 'Se existir uma conta com este email ou CPF, enviamos um código de verificação.'
        };
    }
    async verifyCode(verifyCodeDto) {
        const resetToken = await this.passwordResetService.verifyResetCode(verifyCodeDto.identifier, verifyCodeDto.code);
        return { resetToken };
    }
    async resetPassword(resetPasswordDto) {
        await this.passwordResetService.resetPassword(resetPasswordDto.resetToken, resetPasswordDto.newPassword);
        return {
            message: 'Senha alterada com sucesso. Faça login com sua nova senha.'
        };
    }
};
exports.PasswordResetController = PasswordResetController;
__decorate([
    (0, common_1.Post)('forgot'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [password_reset_dto_1.ForgotPasswordDto, Object]),
    __metadata("design:returntype", Promise)
], PasswordResetController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [password_reset_dto_1.VerifyResetCodeDto]),
    __metadata("design:returntype", Promise)
], PasswordResetController.prototype, "verifyCode", null);
__decorate([
    (0, common_1.Post)('reset'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [password_reset_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], PasswordResetController.prototype, "resetPassword", null);
exports.PasswordResetController = PasswordResetController = __decorate([
    (0, common_1.Controller)('auth/password'),
    __metadata("design:paramtypes", [password_reset_service_1.PasswordResetService])
], PasswordResetController);
//# sourceMappingURL=password-reset.controller.js.map