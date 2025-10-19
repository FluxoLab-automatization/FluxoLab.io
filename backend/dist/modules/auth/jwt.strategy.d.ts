import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { AppConfig } from '../../config/env.validation';
import { JwtPayload } from '../../shared/auth/token.service';
import { UsersRepository } from './users.repository';
import { AuthenticatedUser } from './auth.types';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithoutRequest] | [opt: import("passport-jwt").StrategyOptionsWithRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly config;
    private readonly usersRepository;
    constructor(config: ConfigService<AppConfig, true>, usersRepository: UsersRepository);
    validate(payload: JwtPayload): Promise<AuthenticatedUser>;
}
export {};
