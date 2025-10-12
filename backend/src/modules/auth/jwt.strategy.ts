import { Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfig } from '../../config/env.validation';
import { JwtPayload } from '../../shared/auth/token.service';
import { UsersRepository } from './users.repository';
import { mapToAuthenticatedUser } from './auth.mapper';
import { AuthenticatedUser } from './auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService<AppConfig, true>,
    private readonly usersRepository: UsersRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET', { infer: true }),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    try {
      const user = await this.usersRepository.findById(payload.sub);
      if (!user) throw new UnauthorizedException('Token inválido ou expirado.');

      // mapper agora não lança numa falta de workspaceId
      return mapToAuthenticatedUser(user);
    } catch (e: any) {
      // Evita 500 por Error genérica
      if (e instanceof UnauthorizedException || e instanceof UnprocessableEntityException) throw e;
      throw new UnauthorizedException('Falha na validação do token/perfil.');
    }
  }
}
