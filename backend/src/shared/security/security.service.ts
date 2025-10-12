import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { AppConfig } from '../../config/env.validation';

@Injectable()
export class SecurityService {
  private readonly tokenSecret: string;

  constructor(private readonly config: ConfigService<AppConfig, true>) {
    this.tokenSecret =
      this.config.get('TOKEN_HASH_SECRET', { infer: true }) ||
      this.config.get('APP_SECRET', { infer: true }) ||
      'local-dev-pepper';
  }

  hashToken(token: string): string {
    if (!token) {
      throw new Error('Token value is required to compute the hash');
    }

    return crypto
      .createHmac('sha256', this.tokenSecret)
      .update(token)
      .digest('hex');
  }

  maskToken(token: string | null | undefined): string {
    if (!token || token.length < 10) {
      return 'hidden';
    }
    return `${token.slice(0, 6)}***${token.slice(-4)}`;
  }

  ensureLeadingSlash(pathValue: string | undefined | null): string {
    if (!pathValue) {
      return '/';
    }
    let result = pathValue.trim();
    if (!result.startsWith('/')) {
      result = `/${result}`;
    }
    if (result.length > 1 && result.endsWith('/')) {
      result = result.slice(0, -1);
    }
    return result;
  }
}
