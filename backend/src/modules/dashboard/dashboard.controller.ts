import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireWorkspaceGuard } from '../auth/require-workspace.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { DashboardService } from './dashboard.service';

@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Get('overview')
  async getOverview(@CurrentUser() user: AuthenticatedUser) {
    const workspaceId = user.workspaceId as string;
    const overview = await this.dashboardService.getOverview(workspaceId);
    return {
      status: 'ok',
      ...overview,
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Get('stats')
  async getStats(
    @CurrentUser() user: AuthenticatedUser,
    @Query('period') period: string = '7d',
  ) {
    const workspaceId = user.workspaceId as string;
    const stats = await this.dashboardService.getStats(workspaceId, period);
    return {
      status: 'ok',
      stats,
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Get('workflows')
  async getWorkflows(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('status') status?: string,
  ) {
    const workspaceId = user.workspaceId as string;
    const workflows = await this.dashboardService.getWorkflows(workspaceId, {
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
      search,
      sortBy: sortBy || 'updated_at',
      status,
    });
    return {
      status: 'ok',
      workflows,
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Get('executions')
  async getExecutions(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('workflowId') workflowId?: string,
  ) {
    const workspaceId = user.workspaceId as string;
    const executions = await this.dashboardService.getExecutions(workspaceId, {
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
      workflowId,
    });
    return {
      status: 'ok',
      executions,
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Get('credentials')
  async getCredentials(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const workspaceId = user.workspaceId as string;
    const credentials = await this.dashboardService.getCredentials(workspaceId, {
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
    return {
      status: 'ok',
      credentials,
    };
  }
}

