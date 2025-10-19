import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import {
  createHmac,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from 'crypto';
import type { AppConfig } from '../../config/env.validation';
import { SecurityService } from '../../shared/security/security.service';
import { GenerateWebhookDto } from './dto/generate-webhook.dto';
import {
  WebhookRegistration,
  WorkflowWebhookService,
} from '../workflows/workflow-webhook.service';

interface VerifyQuery {
  'hub.mode'?: string;
  'hub.verify_token'?: string;
  'hub.challenge'?: string;
  [key: string]: string | string[] | undefined;
}

interface SignatureCheckResult {
  valid: boolean;
  reason: string;
  signature?: string | null;
}

interface MetaEventPayload {
  entry?: Array<{
    changes?: Array<{
      field?: string;
    }>;
  }>;
  event?: unknown;
}

function isMetaEventPayload(value: unknown): value is MetaEventPayload {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  if (candidate.entry && !Array.isArray(candidate.entry)) {
    return false;
  }

  if (candidate.entry) {
    const entries = candidate.entry as unknown[];
    if (!entries.every((entry) => entry && typeof entry === 'object')) {
      return false;
    }
  }

  return true;
}

@Injectable()
export class WebhooksService {
  private readonly baseUrl: string;
  private readonly receivingBasePath: string;
  private readonly verifyToken: string;
  private readonly appSecret: string;

  constructor(
    private readonly webhookService: WorkflowWebhookService,
    private readonly securityService: SecurityService,
    private readonly config: ConfigService<AppConfig, true>,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(WebhooksService.name);

    const port = this.config.get('PORT', { infer: true });
    this.baseUrl =
      this.config.get('BASE_URL', { infer: true }) ??
      `http://localhost:${port}`;
    this.receivingBasePath = this.securityService.ensureLeadingSlash(
      this.config.get('RECEIVING_BASE_PATH', { infer: true }),
    );
    this.verifyToken = this.config.get('VERIFY_TOKEN', { infer: true });
    this.appSecret = this.config.get('APP_SECRET', { infer: true }) ?? '';
  }

  async generateWebhook(dto: GenerateWebhookDto) {
    const token = randomBytes(24).toString('hex');
    const relativePathCandidate = this.normalizeRelativePath(dto.path);
    const relativePath =
      relativePathCandidate.length > 0 ? relativePathCandidate : token;
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

    this.logger.info(
      {
        registrationId: registration.id,
        workspaceId: dto.workspaceId,
        workflowId: dto.workflowId,
        token: this.securityService.maskToken(token),
      },
      'Webhook token generated',
    );

    return {
      status: 'generated',
      message: 'Webhook URL generated successfully.',
      token,
      webhookUrl,
      registrationId: registration.id,
    };
  }

  async verifyWebhook(
    token: string,
    query: VerifyQuery,
    headers: Record<string, unknown>,
  ): Promise<string> {
    const registration = await this.requireRegistration(token);
    const snapshotHeaders = this.headerSnapshot(headers);
    const normalizedQuery = this.normalizeQuery(query);

    const mode =
      typeof query['hub.mode'] === 'string' ? query['hub.mode'] : undefined;
    const verifyTokenQuery =
      typeof query['hub.verify_token'] === 'string'
        ? query['hub.verify_token']
        : undefined;
    const challenge =
      typeof query['hub.challenge'] === 'string'
        ? query['hub.challenge']
        : undefined;

    if (!mode || !verifyTokenQuery) {
      throw new BadRequestException({
        status: 'error',
        message: 'Missing hub.mode or hub.verify_token',
      });
    }

    if (mode === 'subscribe' && verifyTokenQuery === this.verifyToken) {
      await this.webhookService.recordEvent({
        workspaceId: registration.workspaceId,
        webhookId: registration.id,
        correlationId: randomUUID(),
        method: 'GET',
        headers: snapshotHeaders,
        query: normalizedQuery,
        body: { mode, query: normalizedQuery },
        rawBody: null,
        signature: null,
        idempotencyKey: null,
        status: 'processed',
      });

      this.logger.info(
        {
          registrationId: registration.id,
          token: this.securityService.maskToken(token),
        },
        'Webhook verification accepted',
      );

      return challenge ?? 'verified';
    }

    await this.webhookService.recordEvent({
      workspaceId: registration.workspaceId,
      webhookId: registration.id,
      correlationId: randomUUID(),
      method: 'GET',
      headers: snapshotHeaders,
      query: normalizedQuery,
      body: { mode, query: normalizedQuery },
      rawBody: null,
      signature: null,
      idempotencyKey: null,
      status: 'failed',
    });

    this.logger.warn(
      {
        registrationId: registration.id,
        token: this.securityService.maskToken(token),
      },
      'Webhook verification rejected (verify token mismatch)',
    );

    throw new ForbiddenException({
      status: 'error',
      message: 'verify_token_mismatch',
    });
  }

  async receiveWebhook(
    token: string,
    method: string,
    query: Record<string, unknown>,
    body: unknown,
    headers: Record<string, unknown>,
    rawBody: Buffer | undefined,
  ) {
    const registration = await this.requireRegistration(token);
    const snapshotHeaders = this.headerSnapshot(headers);
    const signatureCheck = this.verifyMetaSignature(headers, rawBody);
    const correlationId = randomUUID();
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

      this.logger.warn(
        {
          registrationId: registration.id,
          token: this.securityService.maskToken(token),
          reason: signatureCheck.reason,
        },
        'Rejected event due to invalid signature',
      );

      throw new UnauthorizedException({
        status: 'error',
        message: 'Invalid signature.',
      });
    }

    const contentType =
      (typeof headers['content-type'] === 'string' &&
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

      throw new BadRequestException({
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'processing_failed';

      await this.webhookService.updateEventStatus(eventId, 'failed');

      this.logger.error(
        {
          registrationId: registration.id,
          error:
            error instanceof Error
              ? { message: error.message, name: error.name }
              : { value: String(error) },
        },
        'Failed to process webhook event',
      );

      throw new InternalServerErrorException({
        status: 'error',
        message: 'Failed to process webhook event.',
      });
    }
  }

  private async requireRegistration(token: string) {
    try {
      return await this.webhookService.getRegistrationByToken(token);
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(
          { token: this.securityService.maskToken(token) },
          'Webhook token not found or inactive',
        );
      }

      throw error instanceof NotFoundException
        ? error
        : new NotFoundException({
            status: 'error',
            message: 'Webhook token not found or inactive.',
          });
    }
  }

  private verifyMetaSignature(
    headers: Record<string, unknown>,
    rawBody: Buffer | undefined,
  ): SignatureCheckResult {
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

    const expected = createHmac('sha256', this.appSecret)
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
      const valid = timingSafeEqual(providedBuffer, expectedBuffer);
      return {
        valid,
        reason: valid ? 'matched' : 'mismatch',
        signature: signatureHeader,
      };
    } catch (error) {
      this.logger.warn(
        {
          error:
            error instanceof Error
              ? { message: error.message, name: error.name }
              : { value: String(error) },
        },
        'Failed to compare webhook signature',
      );
      return {
        valid: false,
        reason: 'comparison_failed',
        signature: signatureHeader,
      };
    }
  }

  private buildProcessingSummary(
    registration: WebhookRegistration,
    eventData: unknown,
  ) {
    const receivedType = this.extractEventType(eventData);
    return {
      routeTo: registration.workflowId,
      workspaceId: registration.workspaceId,
      receivedType,
      respondMode: registration.respondMode,
      instruction:
        'Payload stored and ready for workflow execution via orchestrator.',
      payloadSize: Buffer.byteLength(JSON.stringify(eventData ?? {}), 'utf8'),
    };
  }

  private extractEventType(eventData: unknown): string {
    if (isMetaEventPayload(eventData) && Array.isArray(eventData.entry)) {
      for (const entry of eventData.entry) {
        if (!entry || !Array.isArray(entry.changes)) {
          continue;
        }
        const changeWithField = entry.changes.find(
          (change) => change && typeof change.field === 'string',
        );
        if (changeWithField?.field) {
          return changeWithField.field;
        }
      }
    }

    if (eventData && typeof eventData === 'object' && 'event' in eventData) {
      const eventField = (eventData as Record<string, unknown>).event;
      if (typeof eventField === 'string') {
        return eventField;
      }
    }

    return 'unknown';
  }

  private normalizeQuery(query: VerifyQuery | Record<string, unknown>) {
    const normalized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(query ?? {})) {
      if (Array.isArray(value)) {
        normalized[key] = value;
      } else if (value !== undefined) {
        normalized[key] = value;
      }
    }
    return normalized;
  }

  private extractSignatureHeader(headers: Record<string, unknown>): string | null {
    const lower = Object.entries(headers ?? {}).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        if (typeof value === 'string') {
          acc[key.toLowerCase()] = value;
        }
        return acc;
      },
      {},
    );
    return lower['x-hub-signature-256'] ?? null;
  }

  private normalizeRelativePath(path?: string): string {
    if (!path) {
      return '';
    }
    return path.trim().replace(/^\/+/, '').replace(/\/+$/, '');
  }

  private buildRoutePath(relative: string): string {
    const combined = `${this.receivingBasePath}/${relative}`.replace(
      /\/{2,}/g,
      '/',
    );
    return combined.endsWith('/') && combined !== '/' ? combined.slice(0, -1) : combined;
  }

  private headerSnapshot(
    headers: Record<string, unknown>,
  ): Record<string, unknown> {
    const snapshot: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(headers ?? {})) {
      snapshot[key.toLowerCase()] = value;
    }
    return snapshot;
  }
}
