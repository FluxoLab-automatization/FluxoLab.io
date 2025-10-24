"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PasswordResetService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordResetService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const database_service_1 = require("../../shared/database/database.service");
const password_service_1 = require("../../shared/auth/password.service");
const mailer_service_1 = require("../../shared/mail/mailer.service");
const crypto = __importStar(require("crypto"));
let PasswordResetService = PasswordResetService_1 = class PasswordResetService {
    database;
    passwordService;
    jwtService;
    mailerService;
    config;
    logger = new common_1.Logger(PasswordResetService_1.name);
    codeTtlMinutes = 10;
    resetTokenTtlMinutes = 10;
    maxAttempts = 5;
    maxRequestsPerHour = 5;
    constructor(database, passwordService, jwtService, mailerService, config) {
        this.database = database;
        this.passwordService = passwordService;
        this.jwtService = jwtService;
        this.mailerService = mailerService;
        this.config = config;
    }
    get pool() {
        return this.database.getPool();
    }
    generateCode() {
        const code = crypto.randomInt(0, 1000000);
        return code.toString().padStart(6, '0');
    }
    isValidEmailOrCpf(identifier) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/;
        return emailRegex.test(identifier) || cpfRegex.test(identifier);
    }
    normalizeCpf(cpf) {
        return cpf.replace(/\D/g, '');
    }
    async findUserByIdentifier(identifier) {
        const normalizedIdentifier = identifier.toLowerCase().trim();
        if (normalizedIdentifier.includes('@')) {
            const result = await this.pool.query(`
        SELECT id, email, display_name, cpf
        FROM users
        WHERE LOWER(email) = $1
        LIMIT 1
      `, [normalizedIdentifier]);
            return result.rows[0] || null;
        }
        const normalizedCpf = this.normalizeCpf(identifier);
        if (normalizedCpf.length === 11) {
            const result = await this.pool.query(`
        SELECT id, email, display_name, cpf
        FROM users
        WHERE cpf = $1
        LIMIT 1
      `, [normalizedCpf]);
            return result.rows[0] || null;
        }
        return null;
    }
    async checkRateLimit(identifier, ipAddress) {
        try {
            const identifierResult = await this.pool.query(`
        SELECT check_password_reset_rate_limit($1, 'email', $2) as allowed
      `, [identifier, this.maxRequestsPerHour]);
            if (!identifierResult.rows[0].allowed) {
                return false;
            }
            if (ipAddress) {
                const ipResult = await this.pool.query(`
          SELECT check_password_reset_rate_limit($1, 'ip', $2) as allowed
        `, [ipAddress, this.maxRequestsPerHour]);
                if (!ipResult.rows[0].allowed) {
                    return false;
                }
            }
            return true;
        }
        catch (error) {
            this.logger.error('Erro ao verificar rate limit:', error);
            return false;
        }
    }
    async requestPasswordReset(identifier, ipAddress, userAgent) {
        if (!this.isValidEmailOrCpf(identifier)) {
            throw new common_1.BadRequestException('Formato de email ou CPF inválido');
        }
        const rateLimitOk = await this.checkRateLimit(identifier, ipAddress);
        if (!rateLimitOk) {
            throw new common_1.BadRequestException('Muitas tentativas. Tente novamente em 1 hora');
        }
        const user = await this.findUserByIdentifier(identifier);
        if (!user) {
            this.logger.log(`Tentativa de reset para usuário não encontrado: ${identifier}`);
            return;
        }
        await this.pool.query(`
      SELECT invalidate_user_password_resets($1)
    `, [user.id]);
        const code = this.generateCode();
        const codeHash = await this.passwordService.hashPassword(code);
        const expiresAt = new Date(Date.now() + this.codeTtlMinutes * 60 * 1000);
        await this.pool.query(`
      INSERT INTO password_reset_requests (
        user_id, code_hash, expires_at, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5)
    `, [user.id, codeHash, expiresAt, ipAddress, userAgent]);
        try {
            await this.mailerService.sendPasswordResetCode(user.email, user.display_name, code, this.codeTtlMinutes);
            this.logger.log(`Código de reset enviado para ${user.email}`);
        }
        catch (error) {
            this.logger.error(`Erro ao enviar email para ${user.email}:`, error);
        }
    }
    async verifyResetCode(identifier, code) {
        const user = await this.findUserByIdentifier(identifier);
        if (!user) {
            throw new common_1.BadRequestException('Código inválido ou expirado');
        }
        const result = await this.pool.query(`
      SELECT id, code_hash, expires_at, attempts
      FROM password_reset_requests
      WHERE user_id = $1
        AND consumed_at IS NULL
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `, [user.id]);
        if (result.rows.length === 0) {
            throw new common_1.BadRequestException('Código inválido ou expirado');
        }
        const request = result.rows[0];
        if (request.attempts >= this.maxAttempts) {
            throw new common_1.BadRequestException('Código bloqueado por muitas tentativas');
        }
        const isValid = await this.passwordService.comparePassword(code, request.code_hash);
        await this.pool.query(`
      UPDATE password_reset_requests
      SET attempts = attempts + 1
      WHERE id = $1
    `, [request.id]);
        if (!isValid) {
            throw new common_1.BadRequestException('Código inválido ou expirado');
        }
        await this.pool.query(`
      UPDATE password_reset_requests
      SET consumed_at = NOW()
      WHERE id = $1
    `, [request.id]);
        const resetToken = await this.jwtService.signAsync({
            sub: user.id,
            purpose: 'password_reset',
            jti: request.id,
        }, {
            expiresIn: `${this.resetTokenTtlMinutes}m`,
        });
        this.logger.log(`Código verificado com sucesso para ${user.email}`);
        return resetToken;
    }
    async resetPassword(resetToken, newPassword) {
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(resetToken);
        }
        catch (error) {
            throw new common_1.BadRequestException('Token inválido ou expirado');
        }
        if (payload.purpose !== 'password_reset') {
            throw new common_1.BadRequestException('Token inválido');
        }
        const result = await this.pool.query(`
      SELECT id, consumed_at
      FROM password_reset_requests
      WHERE id = $1
    `, [payload.jti]);
        if (result.rows.length === 0 || !result.rows[0].consumed_at) {
            throw new common_1.BadRequestException('Token inválido ou expirado');
        }
        const passwordHash = await this.passwordService.hashPassword(newPassword);
        await this.pool.query(`
      UPDATE users
      SET password_hash = $1, updated_at = NOW()
      WHERE id = $2
    `, [passwordHash, payload.sub]);
        this.logger.log(`Senha alterada com sucesso para usuário ${payload.sub}`);
    }
    async cleanupExpiredRequests() {
        try {
            const result = await this.pool.query(`
        SELECT cleanup_expired_password_resets() as deleted_count
      `);
            const deletedCount = result.rows[0].deleted_count;
            this.logger.log(`Limpeza: ${deletedCount} pedidos expirados removidos`);
            return deletedCount;
        }
        catch (error) {
            this.logger.error('Erro na limpeza de pedidos expirados:', error);
            return 0;
        }
    }
};
exports.PasswordResetService = PasswordResetService;
exports.PasswordResetService = PasswordResetService = PasswordResetService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        password_service_1.PasswordService,
        jwt_1.JwtService,
        mailer_service_1.MailerService,
        config_1.ConfigService])
], PasswordResetService);
//# sourceMappingURL=password-reset.service.js.map