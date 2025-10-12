"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const password_service_1 = require("../../shared/auth/password.service");
const token_service_1 = require("../../shared/auth/token.service");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const jwt_strategy_1 = require("./jwt.strategy");
const users_repository_1 = require("./users.repository");
const profiles_repository_1 = require("./profiles.repository");
const user_settings_repository_1 = require("./user-settings.repository");
const user_security_repository_1 = require("./user-security.repository");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    secret: config.get('JWT_SECRET', { infer: true }),
                    signOptions: {
                        expiresIn: config.get('JWT_EXPIRES_IN', { infer: true }),
                    },
                }),
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            users_repository_1.UsersRepository,
            profiles_repository_1.ProfilesRepository,
            password_service_1.PasswordService,
            token_service_1.TokenService,
            jwt_strategy_1.JwtStrategy,
            jwt_auth_guard_1.JwtAuthGuard,
            user_settings_repository_1.UserSettingsRepository,
            user_security_repository_1.UserSecurityRepository,
        ],
        exports: [
            auth_service_1.AuthService,
            jwt_auth_guard_1.JwtAuthGuard,
            users_repository_1.UsersRepository,
            profiles_repository_1.ProfilesRepository,
            user_settings_repository_1.UserSettingsRepository,
            user_security_repository_1.UserSecurityRepository,
        ],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map