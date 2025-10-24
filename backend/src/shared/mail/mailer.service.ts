import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { AppConfig } from '../../config/env.validation';
import { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private readonly transporter: Transporter;

  constructor(private readonly config: ConfigService<AppConfig, true>) {
    this.transporter = nodemailer.createTransport({ // CORREÇÃO: createTransport
      host: this.config.get('SMTP_HOST', { infer: true }),
      port: this.config.get('SMTP_PORT', { infer: true }),
      secure: this.config.get('SMTP_PORT', { infer: true }) === 465, // true para 465, false para outras portas
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
    expiresInMinutes = 10,
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

  private buildPasswordResetEmailHtml(name: string, code: string, expiresInMinutes: number): string {
    // Seu template HTML aqui...
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

  private buildPasswordResetEmailText(name: string, code: string, expiresInMinutes: number): string {
    // Seu template de texto aqui...
    return `Olá ${name},\nSeu código de verificação é: ${code}\nEste código expira em ${expiresInMinutes} minutos.`;
  }

  async sendWelcomeEmail(to: string, name: string, workspaceName: string): Promise<void> {
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
    // Seu template HTML de boas-vindas aqui...
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

  private buildWelcomeEmailText(name: string, workspaceName: string): string {
    // Seu template de texto de boas-vindas aqui...
    return `Bem-vindo, ${name}!\nSua conta no workspace ${workspaceName} foi criada.`;
  }

  private async send(options: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<SMTPTransport.SentMessageInfo> {
    try {
      const info = await this.transporter.sendMail({
        from: this.config.get('MAIL_FROM', { infer: true }),
        ...options,
      });
      this.logger.log(`Email enviado com sucesso para ${options.to}`);
      return info;
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
