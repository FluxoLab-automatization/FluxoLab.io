import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireWorkspaceGuard } from '../auth/require-workspace.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CreateProjectDto } from './dto/create-project.dto';

@Controller('api/workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Get('overview')
  async getOverview(@CurrentUser() user: AuthenticatedUser) {
    const overview = await this.workspaceService.getOverview(user);
    return {
      status: 'ok',
      overview,
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
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

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
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

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Post('projects')
  async createProject(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: CreateProjectDto,
  ) {
    const project = await this.workspaceService.createProject(user, payload);
    return {
      status: 'created',
      project,
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Get('webhooks/recent')
  async listRecentWebhooks(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const events = await this.workspaceService.listRecentWebhooks(user, limit);
    return {
      status: 'ok',
      events,
    };
  }
}
