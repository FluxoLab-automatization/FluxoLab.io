import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireWorkspaceGuard } from '../auth/require-workspace.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { WebhooksService } from './webhooks.service';

@Controller('api/webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Post()
  async createWebhook(
    @CurrentUser() user: AuthenticatedUser,
    @Body() webhookData: any,
  ) {
    const workspaceId = user.workspaceId as string;
    const webhook = await this.webhooksService.createWebhook(workspaceId, {
      ...webhookData,
      createdBy: user.id,
    });
    return {
      status: 'ok',
      webhook,
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Get()
  async listWebhooks(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const workspaceId = user.workspaceId as string;
    const webhooks = await this.webhooksService.listWebhooks(workspaceId, {
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
    return {
      status: 'ok',
      webhooks,
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Get(':webhookId')
  async getWebhook(
    @CurrentUser() user: AuthenticatedUser,
    @Param('webhookId') webhookId: string,
  ) {
    const workspaceId = user.workspaceId as string;
    const webhook = await this.webhooksService.getWebhook(workspaceId, webhookId);
    return {
      status: 'ok',
      webhook,
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Put(':webhookId')
  async updateWebhook(
    @CurrentUser() user: AuthenticatedUser,
    @Param('webhookId') webhookId: string,
    @Body() webhookData: any,
  ) {
    const workspaceId = user.workspaceId as string;
    const webhook = await this.webhooksService.updateWebhook(workspaceId, webhookId, webhookData);
    return {
      status: 'ok',
      webhook,
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Delete(':webhookId')
  async deleteWebhook(
    @CurrentUser() user: AuthenticatedUser,
    @Param('webhookId') webhookId: string,
  ) {
    const workspaceId = user.workspaceId as string;
    await this.webhooksService.deleteWebhook(workspaceId, webhookId);
    return {
      status: 'ok',
      message: 'Webhook deleted successfully',
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Post(':webhookId/test')
  async testWebhook(
    @CurrentUser() user: AuthenticatedUser,
    @Param('webhookId') webhookId: string,
    @Body() testData: any,
  ) {
    const workspaceId = user.workspaceId as string;
    const result = await this.webhooksService.testWebhook(workspaceId, webhookId, testData);
    return {
      status: 'ok',
      result,
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Get(':webhookId/logs')
  async getWebhookLogs(
    @CurrentUser() user: AuthenticatedUser,
    @Param('webhookId') webhookId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const workspaceId = user.workspaceId as string;
    const logs = await this.webhooksService.getWebhookLogs(workspaceId, webhookId, {
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
    return {
      status: 'ok',
      logs,
    };
  }

  // Public endpoint for webhook execution (no auth required)
  @Post('execute/:token')
  async executeWebhook(
    @Param('token') token: string,
    @Body() payload: any,
    @Query() query: any,
  ) {
    const result = await this.webhooksService.executeWebhook(token, {
      payload,
      query,
      headers: {}, // TODO: Extract from request headers
      method: 'POST', // TODO: Extract from request method
    });
    return result;
  }
}