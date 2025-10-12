import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AppConfig } from '../../config/env.validation';

@Injectable()
export class PasswordService {
  private readonly saltRounds: number;

  constructor(private readonly config: ConfigService<AppConfig, true>) {
    this.saltRounds = this.config.get('BCRYPT_SALT_ROUNDS', { infer: true });
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
