import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';

@Controller('api/workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @UseGuards(JwtAuthGuard)
  @Get('overview')
  async getOverview(@CurrentUser() user: AuthenticatedUser) {
    const overview = await this.workspaceService.getOverview(user);
    return {
      status: 'ok',
      overview,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('projects')
  async listProjects(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
  ) {
    const projects = await this.workspaceService.listProjects(user, limit);
    return {
      status: 'ok',
      projects,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('activities')
  async listActivities(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
  ) {
    const activities = await this.workspaceService.listActivities(user, limit);
    return {
      status: 'ok',
      activities,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('webhooks/recent')
  async listRecentWebhooks(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const events = await this.workspaceService.listRecentWebhooks(limit);
    return {
      status: 'ok',
      events,
    };
  }
}
