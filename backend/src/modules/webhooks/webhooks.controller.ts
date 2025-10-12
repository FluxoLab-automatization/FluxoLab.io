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

interface VerifyQuery {
  'hub.mode'?: string;
  'hub.verify_token'?: string;
  'hub.challenge'?: string;
  [key: string]: string | string[] | undefined;
}

@Controller('api')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

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
  receiveWebhook(
    @Param('token') token: string,
    @Body() body: unknown,
    @Headers() headers: Record<string, unknown>,
    @Req() req: Request & { rawBody?: Buffer },
  ) {
    return this.webhooksService.receiveWebhook(
      token,
      body,
      headers,
      req.rawBody,
    );
  }
}
