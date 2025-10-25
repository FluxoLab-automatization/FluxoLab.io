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
var MailerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let MailerService = MailerService_1 = class MailerService {
    config;
    logger = new common_1.Logger(MailerService_1.name);
    transporter;
    constructor(config) {
        this.config = config;
        this.transporter = nodemailer.createTransport({
            host: this.config.get('SMTP_HOST', { infer: true }),
            port: this.config.get('SMTP_PORT', { infer: true }),
            secure: this.config.get('SMTP_PORT', { infer: true }) === 465,
            auth: {
                user: this.config.get('SMTP_USER', { infer: true }),
                pass: this.config.get('SMTP_PASS', { infer: true }),
            },
        });
    }
    async sendPasswordResetCode(to, name, code, expiresInMinutes = 10) {
        const subject = 'FluxoLab • Código de verificação';
        const html = this.buildPasswordResetEmailHtml(name, code, expiresInMinutes);
        const text = this.buildPasswordResetEmailText(name, code, expiresInMinutes);
        await this.send({
            to,
            subject,
            html,
            text,
        });
    }
    buildPasswordResetEmailHtml(name, code, expiresInMinutes) {
        return `
      <!DOCTYPE html>
      <html>
        <body>
          <p>Olá ${name},</p>
          <p>Seu código de verificação é: <strong>${code}</strong></p>
          <p>Este código expira em ${expiresInMinutes} minutos.</p>
        </body>
      </html>
    `;
    }
    buildPasswordResetEmailText(name, code, expiresInMinutes) {
        return `Olá ${name},\nSeu código de verificação é: ${code}\nEste código expira em ${expiresInMinutes} minutos.`;
    }
    async sendWelcomeEmail(to, name, workspaceName) {
        const subject = 'Bem-vindo à FluxoLab!';
        const html = this.buildWelcomeEmailHtml(name, workspaceName);
        const text = this.buildWelcomeEmailText(name, workspaceName);
        await this.send({
            to,
            subject,
            html,
            text,
        });
    }
    buildWelcomeEmailHtml(name, workspaceName) {
        return `
      <!DOCTYPE html>
      <html>
        <body>
          <h1>Bem-vindo, ${name}!</h1>
          <p>Sua conta no workspace ${workspaceName} foi criada.</p>
        </body>
      </html>
    `;
    }
    buildWelcomeEmailText(name, workspaceName) {
        return `Bem-vindo, ${name}!\nSua conta no workspace ${workspaceName} foi criada.`;
    }
    async send(options) {
        const smtpPass = this.config.get('SMTP_PASS', { infer: true });
        if (!smtpPass && this.config.get('NODE_ENV', { infer: true }) === 'development') {
            this.logger.warn(`⚠️  MODO DESENVOLVIMENTO: Email não enviado (SMTP_PASS não configurado)`);
            this.logger.warn(`   Para: ${options.to}`);
            this.logger.warn(`   Assunto: ${options.subject}`);
            this.logger.warn(`   Conteúdo: ${options.text}`);
            this.logger.warn(`   Configure SMTP_PASS no .env para enviar emails reais`);
            return { messageId: 'dev-mock-' + Date.now() };
        }
        try {
            const info = await this.transporter.sendMail({
                from: this.config.get('MAIL_FROM', { infer: true }),
                ...options,
            });
            this.logger.log(`Email enviado com sucesso para ${options.to}`);
            return info;
        }
        catch (error) {
            this.logger.error(`Erro ao enviar email para ${options.to}:`, error);
            throw error;
        }
    }
    async verifyConnection() {
        try {
            await this.transporter.verify();
            this.logger.log('Conexão SMTP verificada com sucesso');
            return true;
        }
        catch (error) {
            this.logger.error('Erro na verificação SMTP:', error);
            return false;
        }
    }
};
exports.MailerService = MailerService;
exports.MailerService = MailerService = MailerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailerService);
//# sourceMappingURL=mailer.service.js.map