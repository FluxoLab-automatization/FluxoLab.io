import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../shared/database/database.service';
import { PasswordService } from '../../shared/auth/password.service';
import { MailerService } from '../../shared/mail/mailer.service';
import { AppConfig } from '../../config/env.validation';
import * as crypto from 'crypto';

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);
  private readonly codeTtlMinutes = 10;
  private readonly resetTokenTtlMinutes = 10;
  private readonly maxAttempts = 5;
  private readonly maxRequestsPerHour = 5;

  constructor(
    private readonly database: DatabaseService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  private get pool() {
    return this.database.getPool();
  }

  /**
   * Gera código de 6 dígitos
   */
  private generateCode(): string {
    const code = crypto.randomInt(0, 1000000);
    return code.toString().padStart(6, '0');
  }

  /**
   * Valida se é email ou CPF
   */
  private isValidEmailOrCpf(identifier: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/;
    
    return emailRegex.test(identifier) || cpfRegex.test(identifier);
  }

  /**
   * Normaliza CPF removendo formatação
   */
  private normalizeCpf(cpf: string): string {
    return cpf.replace(/\D/g, '');
  }

  /**
   * Busca usuário por email ou CPF
   */
  private async findUserByIdentifier(identifier: string): Promise<{
    id: string;
    email: string;
    display_name: string;
    cpf?: string;
  } | null> {
    const normalizedIdentifier = identifier.toLowerCase().trim();
    
    // Buscar por email
    if (normalizedIdentifier.includes('@')) {
      const result = await this.pool.query(`
        SELECT id, email, display_name, cpf
        FROM users
        WHERE LOWER(email) = $1
        LIMIT 1
      `, [normalizedIdentifier]);
      
      return result.rows[0] || null;
    }
    
    // Buscar por CPF
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

  /**
   * Verifica rate limit
   */
  private async checkRateLimit(identifier: string, ipAddress?: string): Promise<boolean> {
    try {
      // Verificar rate limit por email/CPF
      const identifierResult = await this.pool.query(`
        SELECT check_password_reset_rate_limit($1, 'email', $2) as allowed
      `, [identifier, this.maxRequestsPerHour]);
      
      if (!identifierResult.rows[0].allowed) {
        return false;
      }
      
      // Verificar rate limit por IP (se fornecido)
      if (ipAddress) {
        const ipResult = await this.pool.query(`
          SELECT check_password_reset_rate_limit($1, 'ip', $2) as allowed
        `, [ipAddress, this.maxRequestsPerHour]);
        
        if (!ipResult.rows[0].allowed) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      this.logger.error('Erro ao verificar rate limit:', error);
      return false;
    }
  }

  /**
   * Solicita reset de senha
   */
  async requestPasswordReset(
    identifier: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    // Validar formato
    if (!this.isValidEmailOrCpf(identifier)) {
      throw new BadRequestException('Formato de email ou CPF inválido');
    }

    // Verificar rate limit
    const rateLimitOk = await this.checkRateLimit(identifier, ipAddress);
    if (!rateLimitOk) {
      throw new BadRequestException('Muitas tentativas. Tente novamente em 1 hora');
    }

    // Buscar usuário
    const user = await this.findUserByIdentifier(identifier);
    
    // Sempre retornar sucesso para evitar enumeração de usuários
    if (!user) {
      this.logger.log(`Tentativa de reset para usuário não encontrado: ${identifier}`);
      return;
    }

    // Invalidar pedidos anteriores
    await this.pool.query(`
      SELECT invalidate_user_password_resets($1)
    `, [user.id]);

    // Gerar código
    const code = this.generateCode();
    const codeHash = await this.passwordService.hashPassword(code);
    const expiresAt = new Date(Date.now() + this.codeTtlMinutes * 60 * 1000);

    // Salvar pedido
    await this.pool.query(`
      INSERT INTO password_reset_requests (
        user_id, code_hash, expires_at, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5)
    `, [user.id, codeHash, expiresAt, ipAddress, userAgent]);

    // Enviar email
    try {
      await this.mailerService.sendPasswordResetCode(
        user.email,
        user.display_name,
        code,
        this.codeTtlMinutes
      );
      
      this.logger.log(`Código de reset enviado para ${user.email}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar email para ${user.email}:`, error);
      // Não falhar o processo se o email não for enviado
    }
  }

  /**
   * Verifica código de reset
   */
  async verifyResetCode(
    identifier: string,
    code: string
  ): Promise<string> {
    // Buscar usuário
    const user = await this.findUserByIdentifier(identifier);
    if (!user) {
      throw new BadRequestException('Código inválido ou expirado');
    }

    // Buscar pedido ativo
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
      throw new BadRequestException('Código inválido ou expirado');
    }

    const request = result.rows[0];

    // Verificar tentativas
    if (request.attempts >= this.maxAttempts) {
      throw new BadRequestException('Código bloqueado por muitas tentativas');
    }

    // Verificar código
    const isValid = await this.passwordService.comparePassword(code, request.code_hash);
    
    // Incrementar tentativas
    await this.pool.query(`
      UPDATE password_reset_requests
      SET attempts = attempts + 1
      WHERE id = $1
    `, [request.id]);

    if (!isValid) {
      throw new BadRequestException('Código inválido ou expirado');
    }

    // Marcar como consumido
    await this.pool.query(`
      UPDATE password_reset_requests
      SET consumed_at = NOW()
      WHERE id = $1
    `, [request.id]);

    // Gerar token de reset
    const resetToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        purpose: 'password_reset',
        jti: request.id,
      },
      {
        expiresIn: `${this.resetTokenTtlMinutes}m`,
      }
    );

    this.logger.log(`Código verificado com sucesso para ${user.email}`);
    return resetToken;
  }

  /**
   * Reseta a senha
   */
  async resetPassword(
    resetToken: string,
    newPassword: string
  ): Promise<void> {
    // Verificar token
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(resetToken);
    } catch (error) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    if (payload.purpose !== 'password_reset') {
      throw new BadRequestException('Token inválido');
    }

    // Verificar se o pedido ainda é válido
    const result = await this.pool.query(`
      SELECT id, consumed_at
      FROM password_reset_requests
      WHERE id = $1
    `, [payload.jti]);

    if (result.rows.length === 0 || !result.rows[0].consumed_at) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    // Hash da nova senha
    const passwordHash = await this.passwordService.hashPassword(newPassword);

    // Atualizar senha
    await this.pool.query(`
      UPDATE users
      SET password_hash = $1, updated_at = NOW()
      WHERE id = $2
    `, [passwordHash, payload.sub]);

    this.logger.log(`Senha alterada com sucesso para usuário ${payload.sub}`);
  }

  /**
   * Limpa pedidos expirados
   */
  async cleanupExpiredRequests(): Promise<number> {
    try {
      const result = await this.pool.query(`
        SELECT cleanup_expired_password_resets() as deleted_count
      `);
      
      const deletedCount = result.rows[0].deleted_count;
      this.logger.log(`Limpeza: ${deletedCount} pedidos expirados removidos`);
      return deletedCount;
    } catch (error) {
      this.logger.error('Erro na limpeza de pedidos expirados:', error);
      return 0;
    }
  }
}
