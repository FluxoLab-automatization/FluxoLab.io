import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { GenerateWebhookDto } from './dto/generate-webhook.dto';
import { WebhooksService } from './webhooks.service';
import { WorkflowOrchestratorService } from '../workflows/workflow-orchestrator.service';

interface VerifyQuery {
  'hub.mode'?: string;
  'hub.verify_token'?: string;
  'hub.challenge'?: string;
  [key: string]: string | string[] | undefined;
}

@Controller('api')
export class WebhooksController {
  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly orchestrator: WorkflowOrchestratorService,
  ) {}

  @Post('generate-webhook')
  generateWebhook(@Body() payload: GenerateWebhookDto) {
    return this.webhooksService.generateWebhook(payload);
  }

  @Get('webhooks/:token')
  async verifyWebhook(
    @Param('token') token: string,
    @Query() query: VerifyQuery,
    @Headers() headers: Record<string, unknown>,
    @Res() res: Response,
  ) {
    const challenge = await this.webhooksService.verifyWebhook(
      token,
      query,
      headers,
    );
    res.status(200).send(challenge);
  }

  @Post('webhooks/:token')
  async receiveWebhook(
    @Param('token') token: string,
    @Body() body: unknown,
    @Headers() headers: Record<string, unknown>,
    @Req() req: Request & { rawBody?: Buffer },
    @Res() res: Response,
  ) {
    let responded = false;
    const respond = (status: number, payload: unknown) => {
      responded = true;
      if (res.headersSent) {
        return;
      }
      if (typeof payload === 'string') {
        res.status(status).send(payload);
      } else {
        res.status(status).json(payload);
      }
    };

    try {
      const result = await this.orchestrator.triggerViaWebhook({
        token,
        method: req.method,
        headers,
        query: req.query as Record<string, unknown>,
        body,
        rawBody: req.rawBody ?? null,
        idempotencyKey: req.header('x-idempotency-key') ?? null,
        respond,
      });

      if (!responded && !res.headersSent) {
        respond(202, { status: 'accepted', executionId: result.executionId });
      }
    } catch (error) {
      // fallback to legacy handler
      const response = await this.webhooksService.receiveWebhook(
        token,
        body,
        headers,
        req.rawBody,
      );
      if (!res.headersSent) {
        res.status(200).json(response);
      }
    }
  }
}
