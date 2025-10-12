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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const password_service_1 = require("../../shared/auth/password.service");
const token_service_1 = require("../../shared/auth/token.service");
const auth_mapper_1 = require("./auth.mapper");
const users_repository_1 = require("./users.repository");
const user_settings_repository_1 = require("./user-settings.repository");
const user_security_repository_1 = require("./user-security.repository");
let AuthService = class AuthService {
    usersRepository;
    passwordService;
    tokenService;
    config;
    userSettingsRepository;
    userSecurityRepository;
    constructor(usersRepository, passwordService, tokenService, config, userSettingsRepository, userSecurityRepository) {
        this.usersRepository = usersRepository;
        this.passwordService = passwordService;
        this.tokenService = tokenService;
        this.config = config;
        this.userSettingsRepository = userSettingsRepository;
        this.userSecurityRepository = userSecurityRepository;
    }
    async login(payload) {
        const user = await this.usersRepository.findByEmail(payload.email);
        if (!user) {
            throw new common_1.UnauthorizedException({
                status: 'error',
                message: 'Credenciais invalidas.',
            });
        }
        const valid = await this.passwordService.comparePassword(payload.password, user.password_hash);
        if (!valid) {
            throw new common_1.UnauthorizedException({
                status: 'error',
                message: 'Credenciais invalidas.',
            });
        }
        await this.usersRepository.touchLastLogin(user.id);
        const token = this.tokenService.generateToken({
            sub: user.id,
            email: user.email,
        });
        return {
            status: 'ok',
            token,
            user: (0, auth_mapper_1.mapToPresentedUser)(user),
        };
    }
    async register(payload) {
        const signupAccessToken = this.config.get('SIGNUP_ACCESS_TOKEN', {
            infer: true,
        });
        if (signupAccessToken && payload.accessToken !== signupAccessToken) {
            throw new common_1.ForbiddenException({
                status: 'error',
                message: 'Token de acesso invalido para registro.',
            });
        }
        const existing = await this.usersRepository.findByEmail(payload.email);
        if (existing) {
            throw new common_1.ConflictException({
                status: 'error',
                message: 'E-mail ja cadastrado.',
            });
        }
        const passwordHash = await this.passwordService.hashPassword(payload.password);
        const avatarColor = payload.avatarColor ?? '#6366F1';
        const newUser = await this.usersRepository.createUser({
            email: payload.email,
            passwordHash,
            displayName: payload.displayName,
            avatarColor,
        });
        const [firstName, ...rest] = payload.displayName.split(' ').filter(Boolean);
        const lastName = rest.length > 0 ? rest.join(' ') : null;
        await Promise.all([
            this.userSettingsRepository.ensureUserSettings({
                userId: newUser.id,
                firstName: firstName ?? null,
                lastName,
            }),
            this.userSecurityRepository.ensureSecurityRow(newUser.id),
        ]);
        return {
            status: 'created',
            user: {
                id: newUser.id,
                email: newUser.email,
                displayName: newUser.display_name,
                avatarColor: newUser.avatar_color ?? '#6366F1',
            },
        };
    }
    me(user) {
        return {
            status: 'ok',
            user: (0, auth_mapper_1.presentAuthenticatedUser)(user),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository,
        password_service_1.PasswordService,
        token_service_1.TokenService,
        config_1.ConfigService,
        user_settings_repository_1.UserSettingsRepository,
        user_security_repository_1.UserSecurityRepository])
], AuthService);
//# sourceMappingURL=auth.service.js.map