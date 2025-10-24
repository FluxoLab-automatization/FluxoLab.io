import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { AppConfig } from '../../config/env.validation';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService<AppConfig, true>) {
    this.transporter = nodemailer.createTransporter({
      host: this.config.get('SMTP_HOST', { infer: true }),
      port: this.config.get('SMTP_PORT', { infer: true }),
      secure: false, // STARTTLS
      auth: {
        user: this.config.get('SMTP_USER', { infer: true }),
        pass: this.config.get('SMTP_PASS', { infer: true }),
      },
    });
  }

  async sendPasswordResetCode(
    to: string,
    name: string,
    code: string,
    expiresInMinutes: number = 10
  ): Promise<void> {
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

  private buildPasswordResetEmailHtml(
    name: string,
    code: string,
    expiresInMinutes: number
  ): string {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>FluxoLab - Código de Verificação</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #7c3aed;
            margin-bottom: 10px;
          }
          .code-container {
            background: #f3f4f6;
            border: 2px dashed #d1d5db;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
          }
          .code {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #7c3aed;
            font-family: 'Courier New', monospace;
          }
          .warning {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background: #7c3aed;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">FluxoLab</div>
            <h1>Código de Verificação</h1>
          </div>
          
          <p>Olá <strong>${name}</strong>,</p>
          
          <p>Você solicitou a redefinição da sua senha na FluxoLab. Use o código abaixo para continuar:</p>
          
          <div class="code-container">
            <div class="code">${code}</div>
          </div>
          
          <div class="warning">
            <strong>⚠️ Importante:</strong> Este código expira em <strong>${expiresInMinutes} minutos</strong> e só pode ser usado uma vez.
          </div>
          
          <p>Se você não solicitou esta redefinição, ignore este e-mail. Sua senha permanecerá inalterada.</p>
          
          <div class="footer">
            <p>Este e-mail foi enviado automaticamente pela FluxoLab.</p>
            <p>Para dúvidas, entre em contato: <a href="mailto:fluxolab.contato@gmail.com">fluxolab.contato@gmail.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private buildPasswordResetEmailText(
    name: string,
    code: string,
    expiresInMinutes: number
  ): string {
    return `
FluxoLab - Código de Verificação

Olá ${name},

Você solicitou a redefinição da sua senha na FluxoLab.

Código de verificação: ${code}

Este código expira em ${expiresInMinutes} minutos e só pode ser usado uma vez.

Se você não solicitou esta redefinição, ignore este e-mail. Sua senha permanecerá inalterada.

---
FluxoLab
Para dúvidas: fluxolab.contato@gmail.com
    `.trim();
  }

  async sendWelcomeEmail(
    to: string,
    name: string,
    workspaceName: string
  ): Promise<void> {
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

  private buildWelcomeEmailHtml(name: string, workspaceName: string): string {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bem-vindo à FluxoLab</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #7c3aed;
            margin-bottom: 10px;
          }
          .button {
            display: inline-block;
            background: #7c3aed;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">FluxoLab</div>
            <h1>Bem-vindo!</h1>
          </div>
          
          <p>Olá <strong>${name}</strong>,</p>
          
          <p>Seja bem-vindo à FluxoLab! Sua conta foi criada com sucesso no workspace <strong>${workspaceName}</strong>.</p>
          
          <p>Com a FluxoLab, você pode:</p>
          <ul>
            <li>Automatizar processos complexos</li>
            <li>Integrar sistemas brasileiros nativamente</li>
            <li>Criar workflows visuais intuitivos</li>
            <li>Garantir compliance LGPD/ANS</li>
          </ul>
          
          <p>Comece explorando nossa plataforma e descubra como podemos transformar seus processos!</p>
          
          <div class="footer">
            <p>Este e-mail foi enviado automaticamente pela FluxoLab.</p>
            <p>Para dúvidas, entre em contato: <a href="mailto:fluxolab.contato@gmail.com">fluxolab.contato@gmail.com</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private buildWelcomeEmailText(name: string, workspaceName: string): string {
    return `
Bem-vindo à FluxoLab!

Olá ${name},

Seja bem-vindo à FluxoLab! Sua conta foi criada com sucesso no workspace ${workspaceName}.

Com a FluxoLab, você pode:
- Automatizar processos complexos
- Integrar sistemas brasileiros nativamente
- Criar workflows visuais intuitivos
- Garantir compliance LGPD/ANS

Comece explorando nossa plataforma e descubra como podemos transformar seus processos!

---
FluxoLab
Para dúvidas: fluxolab.contato@gmail.com
    `.trim();
  }

  private async send(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.config.get('MAIL_FROM', { infer: true }),
        ...options,
      });
      
      this.logger.log(`Email enviado com sucesso para ${options.to}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar email para ${options.to}:`, error);
      throw error;
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Conexão SMTP verificada com sucesso');
      return true;
    } catch (error) {
      this.logger.error('Erro na verificação SMTP:', error);
      return false;
    }
  }
}
