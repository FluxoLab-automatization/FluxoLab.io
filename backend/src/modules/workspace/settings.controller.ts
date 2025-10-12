import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import {
  WorkspaceSettingsService,
  type WorkspaceSettingsSummary,
} from './workspace-settings.service';

@Controller('api/settings')
export class SettingsController {
  constructor(
    private readonly workspaceSettingsService: WorkspaceSettingsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  async getSettingsSummary(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ status: 'ok'; summary: WorkspaceSettingsSummary }> {
    const summary = await this.workspaceSettingsService.getSummary(user);
    return {
      status: 'ok',
      summary,
    };
  }
}
