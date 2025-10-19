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
var WebhooksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
const crypto_1 = require("crypto");
const security_service_1 = require("../../shared/security/security.service");
const workflow_webhook_service_1 = require("../workflows/workflow-webhook.service");
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
    webhookService;
    securityService;
    config;
    logger;
    baseUrl;
    receivingBasePath;
    verifyToken;
    appSecret;
    constructor(webhookService, securityService, config, logger) {
        this.webhookService = webhookService;
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
        const token = (0, crypto_1.randomBytes)(24).toString('hex');
        const relativePathCandidate = this.normalizeRelativePath(dto.path);
        const relativePath = relativePathCandidate.length > 0 ? relativePathCandidate : token;
        const routePath = this.buildRoutePath(relativePath);
        const registration = await this.webhookService.registerWebhook({
            workspaceId: dto.workspaceId,
            workflowId: dto.workflowId,
            token,
            path: routePath,
            method: dto.method ?? 'POST',
            respondMode: dto.respondMode ?? 'via_node',
            createdBy: dto.userId ?? null,
            description: dto.description ?? null,
        });
        const webhookUrl = `${this.baseUrl}${routePath}`;
        this.logger.info({
            registrationId: registration.id,
            workspaceId: dto.workspaceId,
            workflowId: dto.workflowId,
            token: this.securityService.maskToken(token),
        }, 'Webhook token generated');
        return {
            status: 'generated',
            message: 'Webhook URL generated successfully.',
            token,
            webhookUrl,
            registrationId: registration.id,
        };
    }
    async verifyWebhook(token, query, headers) {
        const registration = await this.requireRegistration(token);
        const snapshotHeaders = this.headerSnapshot(headers);
        const normalizedQuery = this.normalizeQuery(query);
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
            await this.webhookService.recordEvent({
                workspaceId: registration.workspaceId,
                webhookId: registration.id,
                correlationId: (0, crypto_1.randomUUID)(),
                method: 'GET',
                headers: snapshotHeaders,
                query: normalizedQuery,
                body: { mode, query: normalizedQuery },
                rawBody: null,
                signature: null,
                idempotencyKey: null,
                status: 'processed',
            });
            this.logger.info({
                registrationId: registration.id,
                token: this.securityService.maskToken(token),
            }, 'Webhook verification accepted');
            return challenge ?? 'verified';
        }
        await this.webhookService.recordEvent({
            workspaceId: registration.workspaceId,
            webhookId: registration.id,
            correlationId: (0, crypto_1.randomUUID)(),
            method: 'GET',
            headers: snapshotHeaders,
            query: normalizedQuery,
            body: { mode, query: normalizedQuery },
            rawBody: null,
            signature: null,
            idempotencyKey: null,
            status: 'failed',
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
    async receiveWebhook(token, method, query, body, headers, rawBody) {
        const registration = await this.requireRegistration(token);
        const snapshotHeaders = this.headerSnapshot(headers);
        const signatureCheck = this.verifyMetaSignature(headers, rawBody);
        const correlationId = (0, crypto_1.randomUUID)();
        const normalizedQuery = this.normalizeQuery(query);
        if (!signatureCheck.valid) {
            await this.webhookService.recordEvent({
                workspaceId: registration.workspaceId,
                webhookId: registration.id,
                correlationId,
                method,
                headers: snapshotHeaders,
                query: normalizedQuery,
                body,
                rawBody: rawBody ?? null,
                signature: signatureCheck.signature ?? null,
                idempotencyKey: null,
                status: 'failed',
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
            await this.webhookService.recordEvent({
                workspaceId: registration.workspaceId,
                webhookId: registration.id,
                correlationId,
                method,
                headers: snapshotHeaders,
                query: normalizedQuery,
                body: null,
                rawBody: null,
                signature: signatureCheck.signature ?? null,
                idempotencyKey: null,
                status: 'failed',
            });
            throw new common_1.BadRequestException({
                status: 'error',
                message: 'Content-Type must be application/json.',
            });
        }
        const eventId = await this.webhookService.recordEvent({
            workspaceId: registration.workspaceId,
            webhookId: registration.id,
            correlationId,
            method,
            headers: snapshotHeaders,
            query: normalizedQuery,
            body,
            rawBody: rawBody ?? null,
            signature: signatureCheck.signature ?? null,
            idempotencyKey: null,
            status: 'received',
        });
        try {
            const processing = this.buildProcessingSummary(registration, body);
            await this.webhookService.updateEventStatus(eventId, 'processed');
            return {
                status: 'success',
                message: 'Event received and stored successfully.',
                eventId,
                processing,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'processing_failed';
            await this.webhookService.updateEventStatus(eventId, 'failed');
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
        try {
            return await this.webhookService.getRegistrationByToken(token);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                this.logger.warn({ token: this.securityService.maskToken(token) }, 'Webhook token not found or inactive');
            }
            throw error instanceof common_1.NotFoundException
                ? error
                : new common_1.NotFoundException({
                    status: 'error',
                    message: 'Webhook token not found or inactive.',
                });
        }
    }
    verifyMetaSignature(headers, rawBody) {
        if (!this.appSecret) {
            return { valid: true, reason: 'app_secret_not_configured', signature: null };
        }
        const signatureHeader = this.extractSignatureHeader(headers);
        if (!signatureHeader) {
            return { valid: false, reason: 'missing_signature', signature: null };
        }
        const [scheme, providedHash] = signatureHeader.split('=');
        if (scheme !== 'sha256' || !providedHash) {
            return {
                valid: false,
                reason: 'invalid_signature_format',
                signature: signatureHeader,
            };
        }
        const expected = (0, crypto_1.createHmac)('sha256', this.appSecret)
            .update(rawBody ?? Buffer.alloc(0))
            .digest('hex');
        if (providedHash.length !== expected.length) {
            return {
                valid: false,
                reason: 'length_mismatch',
                signature: signatureHeader,
            };
        }
        try {
            const providedBuffer = Buffer.from(providedHash, 'hex');
            const expectedBuffer = Buffer.from(expected, 'hex');
            const valid = (0, crypto_1.timingSafeEqual)(providedBuffer, expectedBuffer);
            return {
                valid,
                reason: valid ? 'matched' : 'mismatch',
                signature: signatureHeader,
            };
        }
        catch (error) {
            this.logger.warn({
                error: error instanceof Error
                    ? { message: error.message, name: error.name }
                    : { value: String(error) },
            }, 'Failed to compare webhook signature');
            return {
                valid: false,
                reason: 'comparison_failed',
                signature: signatureHeader,
            };
        }
    }
    buildProcessingSummary(registration, eventData) {
        const receivedType = this.extractEventType(eventData);
        return {
            routeTo: registration.workflowId,
            workspaceId: registration.workspaceId,
            receivedType,
            respondMode: registration.respondMode,
            instruction: 'Payload stored and ready for workflow execution via orchestrator.',
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
    normalizeQuery(query) {
        const normalized = {};
        for (const [key, value] of Object.entries(query ?? {})) {
            if (Array.isArray(value)) {
                normalized[key] = value;
            }
            else if (value !== undefined) {
                normalized[key] = value;
            }
        }
        return normalized;
    }
    extractSignatureHeader(headers) {
        const lower = Object.entries(headers ?? {}).reduce((acc, [key, value]) => {
            if (typeof value === 'string') {
                acc[key.toLowerCase()] = value;
            }
            return acc;
        }, {});
        return lower['x-hub-signature-256'] ?? null;
    }
    normalizeRelativePath(path) {
        if (!path) {
            return '';
        }
        return path.trim().replace(/^\/+/, '').replace(/\/+$/, '');
    }
    buildRoutePath(relative) {
        const combined = `${this.receivingBasePath}/${relative}`.replace(/\/{2,}/g, '/');
        return combined.endsWith('/') && combined !== '/' ? combined.slice(0, -1) : combined;
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
    __metadata("design:paramtypes", [workflow_webhook_service_1.WorkflowWebhookService,
        security_service_1.SecurityService,
        config_1.ConfigService,
        nestjs_pino_1.PinoLogger])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map