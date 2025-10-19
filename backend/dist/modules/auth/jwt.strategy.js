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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const users_repository_1 = require("./users.repository");
const auth_mapper_1 = require("./auth.mapper");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    config;
    usersRepository;
    constructor(config, usersRepository) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get('JWT_SECRET', { infer: true }),
        });
        this.config = config;
        this.usersRepository = usersRepository;
    }
    async validate(payload) {
        try {
            const user = await this.usersRepository.findById(payload.sub);
            if (!user)
                throw new common_1.UnauthorizedException('Token invalido ou expirado.');
            const authenticated = (0, auth_mapper_1.mapToAuthenticatedUser)(user);
            if (!authenticated.workspaceId) {
                throw new common_1.UnprocessableEntityException('Workspace padrao nao definido para este usuario.');
            }
            return authenticated;
        }
        catch (e) {
            if (e instanceof common_1.UnauthorizedException || e instanceof common_1.UnprocessableEntityException)
                throw e;
            throw new common_1.UnauthorizedException('Falha na validacao do token/perfil.');
        }
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        users_repository_1.UsersRepository])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map