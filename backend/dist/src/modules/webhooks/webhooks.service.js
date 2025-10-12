"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WebhooksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
const crypto = __importStar(require("crypto"));
const security_service_1 = require("../../shared/security/security.service");
const webhook_registrations_repository_1 = require("./repositories/webhook-registrations.repository");
const webhook_events_repository_1 = require("./repositories/webhook-events.repository");
function isMetaEventPayload(value) {
    if (!value || typeof value !== 'object') {
        return false;
    }
    const candidate = value;
    if (candidate.entry && !Array.isArray(candidate.entry)) {
        return false;
    }
    if (candidate.entry) {
        const entries = candidate.entry;
        if (!entries.every((entry) => entry && typeof entry === 'object')) {
            return false;
        }
    }
    return true;
}
let WebhooksService = WebhooksService_1 = class WebhooksService {
    registrationsRepository;
    eventsRepository;
    securityService;
    config;
    logger;
    baseUrl;
    receivingBasePath;
    verifyToken;
    appSecret;
    constructor(registrationsRepository, eventsRepository, securityService, config, logger) {
        this.registrationsRepository = registrationsRepository;
        this.eventsRepository = eventsRepository;
        this.securityService = securityService;
        this.config = config;
        this.logger = logger;
        this.logger.setContext(WebhooksService_1.name);
        const port = this.config.get('PORT', { infer: true });
        this.baseUrl =
            this.config.get('BASE_URL', { infer: true }) ??
                `http://localhost:${port}`;
        this.receivingBasePath = this.securityService.ensureLeadingSlash(this.config.get('RECEIVING_BASE_PATH', { infer: true }));
        this.verifyToken = this.config.get('VERIFY_TOKEN', { infer: true });
        this.appSecret = this.config.get('APP_SECRET', { infer: true }) ?? '';
    }
    async generateWebhook(dto) {
        const token = crypto.randomBytes(24).toString('hex');
        const tokenHash = this.securityService.hashToken(token);
        const registration = await this.registrationsRepository.createRegistration({
            userId: dto.userId,
            tokenHash,
        });
        const webhookUrl = `${this.baseUrl}${this.receivingBasePath}/${token}`;
        this.logger.info({
            registrationId: registration.id,
            userId: dto.userId,
            token: this.securityService.maskToken(token),
        }, 'Webhook token generated');
        return {
            status: 'generated',
            message: 'Webhook URL generated successfully.',
            token,
            webhookUrl,
        };
    }
    async verifyWebhook(token, query, headers) {
        const registration = await this.requireRegistration(token);
        const mode = typeof query['hub.mode'] === 'string' ? query['hub.mode'] : undefined;
        const verifyTokenQuery = typeof query['hub.verify_token'] === 'string'
            ? query['hub.verify_token']
            : undefined;
        const challenge = typeof query['hub.challenge'] === 'string'
            ? query['hub.challenge']
            : undefined;
        if (!mode || !verifyTokenQuery) {
            throw new common_1.BadRequestException({
                status: 'error',
                message: 'Missing hub.mode or hub.verify_token',
            });
        }
        if (mode === 'subscribe' && verifyTokenQuery === this.verifyToken) {
            await this.registrationsRepository.markVerified(registration.id);
            await this.eventsRepository.recordEvent({
                registrationId: registration.id,
                eventType: 'meta_verification',
                payload: { query },
                headers: this.headerSnapshot(headers),
                signatureValid: true,
                status: 'processed',
            });
            this.logger.info({
                registrationId: registration.id,
                token: this.securityService.maskToken(token),
            }, 'Webhook verification accepted');
            return challenge ?? 'verified';
        }
        await this.eventsRepository.recordEvent({
            registrationId: registration.id,
            eventType: 'meta_verification',
            payload: { query },
            headers: this.headerSnapshot(headers),
            signatureValid: false,
            status: 'rejected',
            errorMessage: 'verify_token_mismatch',
        });
        this.logger.warn({
            registrationId: registration.id,
            token: this.securityService.maskToken(token),
        }, 'Webhook verification rejected (verify token mismatch)');
        throw new common_1.ForbiddenException({
            status: 'error',
            message: 'verify_token_mismatch',
        });
    }
    async receiveWebhook(token, body, headers, rawBody) {
        const registration = await this.requireRegistration(token);
        const signatureCheck = this.verifyMetaSignature(headers, rawBody);
        if (!signatureCheck.valid) {
            await this.eventsRepository.recordEvent({
                registrationId: registration.id,
                eventType: 'webhook_event',
                payload: body,
                headers: this.headerSnapshot(headers),
                signatureValid: false,
                status: 'rejected',
                errorMessage: signatureCheck.reason,
            });
            this.logger.warn({
                registrationId: registration.id,
                token: this.securityService.maskToken(token),
                reason: signatureCheck.reason,
            }, 'Rejected event due to invalid signature');
            throw new common_1.UnauthorizedException({
                status: 'error',
                message: 'Invalid signature.',
            });
        }
        const contentType = (typeof headers['content-type'] === 'string' &&
            headers['content-type']) ||
            '';
        if (!contentType.includes('application/json')) {
            await this.eventsRepository.recordEvent({
                registrationId: registration.id,
                eventType: 'webhook_event',
                payload: null,
                headers: this.headerSnapshot(headers),
                signatureValid: true,
                status: 'rejected',
                errorMessage: 'unsupported_content_type',
            });
            throw new common_1.BadRequestException({
                status: 'error',
                message: 'Content-Type must be application/json.',
            });
        }
        await this.registrationsRepository.updateLastUsedAt(registration.id);
        try {
            const processing = this.processEvent(registration.user_id, body);
            const eventRecord = await this.eventsRepository.recordEvent({
                registrationId: registration.id,
                eventType: processing.receivedType,
                payload: body,
                headers: this.headerSnapshot(headers),
                signatureValid: true,
                status: 'processed',
            });
            return {
                status: 'success',
                message: 'Event received and stored successfully.',
                eventId: eventRecord.id,
                processing,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'processing_failed';
            await this.eventsRepository.recordEvent({
                registrationId: registration.id,
                eventType: this.extractEventType(body),
                payload: body,
                headers: this.headerSnapshot(headers),
                signatureValid: true,
                status: 'error',
                errorMessage,
            });
            this.logger.error({
                registrationId: registration.id,
                error: error instanceof Error
                    ? { message: error.message, name: error.name }
                    : { value: String(error) },
            }, 'Failed to process webhook event');
            throw new common_1.InternalServerErrorException({
                status: 'error',
                message: 'Failed to process webhook event.',
            });
        }
    }
    async requireRegistration(token) {
        const tokenHash = this.securityService.hashToken(token);
        const registration = await this.registrationsRepository.findActiveByTokenHash(tokenHash);
        if (!registration) {
            this.logger.warn({ token: this.securityService.maskToken(token) }, 'Webhook token not found or inactive');
            throw new common_1.NotFoundException({
                status: 'error',
                message: 'Webhook token not found or inactive.',
            });
        }
        return registration;
    }
    verifyMetaSignature(headers, rawBody) {
        if (!this.appSecret) {
            return { valid: true, reason: 'app_secret_not_configured' };
        }
        const signatureHeader = headers['x-hub-signature-256'] ??
            headers['X-Hub-Signature-256'];
        if (!signatureHeader) {
            return { valid: false, reason: 'missing_signature' };
        }
        const [scheme, providedHash] = signatureHeader.split('=');
        if (scheme !== 'sha256' || !providedHash) {
            return { valid: false, reason: 'invalid_signature_format' };
        }
        const expected = crypto
            .createHmac('sha256', this.appSecret)
            .update(rawBody ?? Buffer.alloc(0))
            .digest('hex');
        if (providedHash.length !== expected.length) {
            return { valid: false, reason: 'length_mismatch' };
        }
        try {
            const providedBuffer = Buffer.from(providedHash, 'hex');
            const expectedBuffer = Buffer.from(expected, 'hex');
            const valid = crypto.timingSafeEqual(providedBuffer, expectedBuffer);
            return { valid, reason: valid ? 'matched' : 'mismatch' };
        }
        catch (error) {
            this.logger.warn({
                error: error instanceof Error
                    ? { message: error.message, name: error.name }
                    : { value: String(error) },
            }, 'Failed to compare webhook signature');
            return { valid: false, reason: 'comparison_failed' };
        }
    }
    processEvent(userId, eventData) {
        const receivedType = this.extractEventType(eventData);
        return {
            routeTo: userId,
            receivedType,
            instruction: 'Forward payload to the user specific automation workflow.',
            payloadSize: Buffer.byteLength(JSON.stringify(eventData ?? {}), 'utf8'),
        };
    }
    extractEventType(eventData) {
        if (isMetaEventPayload(eventData) && Array.isArray(eventData.entry)) {
            for (const entry of eventData.entry) {
                if (!entry || !Array.isArray(entry.changes)) {
                    continue;
                }
                const changeWithField = entry.changes.find((change) => change && typeof change.field === 'string');
                if (changeWithField?.field) {
                    return changeWithField.field;
                }
            }
        }
        if (eventData && typeof eventData === 'object' && 'event' in eventData) {
            const eventField = eventData.event;
            if (typeof eventField === 'string') {
                return eventField;
            }
        }
        return 'unknown';
    }
    headerSnapshot(headers) {
        const snapshot = {};
        for (const [key, value] of Object.entries(headers ?? {})) {
            snapshot[key.toLowerCase()] = value;
        }
        return snapshot;
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = WebhooksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [webhook_registrations_repository_1.WebhookRegistrationsRepository,
        webhook_events_repository_1.WebhookEventsRepository,
        security_service_1.SecurityService,
        config_1.ConfigService,
        nestjs_pino_1.PinoLogger])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map