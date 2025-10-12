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
import * as crypto from 'crypto';
import type { AppConfig } from '../../config/env.validation';
import { SecurityService } from '../../shared/security/security.service';
import { GenerateWebhookDto } from './dto/generate-webhook.dto';
import { WebhookRegistrationsRepository } from './repositories/webhook-registrations.repository';
import { WebhookEventsRepository } from './repositories/webhook-events.repository';

interface VerifyQuery {
  'hub.mode'?: string;
  'hub.verify_token'?: string;
  'hub.challenge'?: string;
  [key: string]: string | string[] | undefined;
}

interface SignatureCheckResult {
  valid: boolean;
  reason: string;
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
    private readonly registrationsRepository: WebhookRegistrationsRepository,
    private readonly eventsRepository: WebhookEventsRepository,
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
    const token = crypto.randomBytes(24).toString('hex');
    const tokenHash = this.securityService.hashToken(token);

    const registration = await this.registrationsRepository.createRegistration({
      userId: dto.userId,
      tokenHash,
    });

    const webhookUrl = `${this.baseUrl}${this.receivingBasePath}/${token}`;

    this.logger.info(
      {
        registrationId: registration.id,
        userId: dto.userId,
        token: this.securityService.maskToken(token),
      },
      'Webhook token generated',
    );

    return {
      status: 'generated',
      message: 'Webhook URL generated successfully.',
      token,
      webhookUrl,
    };
  }

  async verifyWebhook(
    token: string,
    query: VerifyQuery,
    headers: Record<string, unknown>,
  ): Promise<string> {
    const registration = await this.requireRegistration(token);

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
      await this.registrationsRepository.markVerified(registration.id);
      await this.eventsRepository.recordEvent({
        registrationId: registration.id,
        eventType: 'meta_verification',
        payload: { query },
        headers: this.headerSnapshot(headers),
        signatureValid: true,
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

    await this.eventsRepository.recordEvent({
      registrationId: registration.id,
      eventType: 'meta_verification',
      payload: { query },
      headers: this.headerSnapshot(headers),
      signatureValid: false,
      status: 'rejected',
      errorMessage: 'verify_token_mismatch',
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
    body: unknown,
    headers: Record<string, unknown>,
    rawBody: Buffer | undefined,
  ) {
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
      await this.eventsRepository.recordEvent({
        registrationId: registration.id,
        eventType: 'webhook_event',
        payload: null,
        headers: this.headerSnapshot(headers),
        signatureValid: true,
        status: 'rejected',
        errorMessage: 'unsupported_content_type',
      });

      throw new BadRequestException({
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'processing_failed';

      await this.eventsRepository.recordEvent({
        registrationId: registration.id,
        eventType: this.extractEventType(body),
        payload: body,
        headers: this.headerSnapshot(headers),
        signatureValid: true,
        status: 'error',
        errorMessage,
      });

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
    const tokenHash = this.securityService.hashToken(token);
    const registration =
      await this.registrationsRepository.findActiveByTokenHash(tokenHash);

    if (!registration) {
      this.logger.warn(
        { token: this.securityService.maskToken(token) },
        'Webhook token not found or inactive',
      );
      throw new NotFoundException({
        status: 'error',
        message: 'Webhook token not found or inactive.',
      });
    }

    return registration;
  }

  private verifyMetaSignature(
    headers: Record<string, unknown>,
    rawBody: Buffer | undefined,
  ): SignatureCheckResult {
    if (!this.appSecret) {
      return { valid: true, reason: 'app_secret_not_configured' };
    }

    const signatureHeader =
      (headers['x-hub-signature-256'] as string | undefined) ??
      (headers['X-Hub-Signature-256'] as string | undefined);

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
      return { valid: false, reason: 'comparison_failed' };
    }
  }

  private processEvent(userId: string, eventData: unknown) {
    const receivedType = this.extractEventType(eventData);
    return {
      routeTo: userId,
      receivedType,
      instruction: 'Forward payload to the user specific automation workflow.',
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
