import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../shared/database/database.service';

export interface WebhookEventInsert {
  registrationId: string;
  eventType: string | null;
  payload: unknown;
  headers: Record<string, unknown> | null;
  signatureValid: boolean;
  status: 'received' | 'processed' | 'rejected' | 'error';
  errorMessage?: string | null;
}

export interface WebhookEventRecord {
  id: string;
  registration_id: string;
  event_type: string | null;
  status: string;
  signature_valid: boolean;
  error_message: string | null;
  received_at: Date;
}

@Injectable()
export class WebhookEventsRepository {
  constructor(private readonly database: DatabaseService) {}

  private get pool() {
    return this.database.getPool();
  }

  async recordEvent(params: WebhookEventInsert): Promise<WebhookEventRecord> {
    const result = await this.pool.query<WebhookEventRecord>(
      `
        INSERT INTO webhook_events
          (registration_id, event_type, payload, headers, signature_valid, status, error_message)
        VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6, $7)
        RETURNING id,
                  registration_id,
                  event_type,
                  status,
                  signature_valid,
                  error_message,
                  received_at
      `,
      [
        params.registrationId,
        params.eventType,
        params.payload ? JSON.stringify(params.payload) : null,
        params.headers ? JSON.stringify(params.headers) : null,
        params.signatureValid,
        params.status,
        params.errorMessage ?? null,
      ],
    );

    return result.rows[0];
  }
}
