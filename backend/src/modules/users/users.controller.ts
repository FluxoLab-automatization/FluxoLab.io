import { Controller, Get, Put, Body, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireWorkspaceGuard } from '../auth/require-workspace.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    const profile = await this.usersService.getUserProfile(user.id);
    return {
      status: 'ok',
      profile,
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Put('profile')
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() profileData: any,
  ) {
    const updatedProfile = await this.usersService.updateUserProfile(user.id, profileData);
    return {
      status: 'ok',
      profile: updatedProfile,
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Get('trial-info')
  async getTrialInfo(@CurrentUser() user: AuthenticatedUser) {
    const trialInfo = await this.usersService.getTrialInfo(user.id);
    return {
      status: 'ok',
      trialInfo,
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Get('workspace-members')
  async getWorkspaceMembers(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const workspaceId = user.workspaceId as string;
    const members = await this.usersService.getWorkspaceMembers(workspaceId, {
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
    return {
      status: 'ok',
      members,
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Get('preferences')
  async getUserPreferences(@CurrentUser() user: AuthenticatedUser) {
    const preferences = await this.usersService.getUserPreferences(user.id);
    return {
      status: 'ok',
      preferences,
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Put('preferences')
  async updateUserPreferences(
    @CurrentUser() user: AuthenticatedUser,
    @Body() preferences: any,
  ) {
    const updatedPreferences = await this.usersService.updateUserPreferences(user.id, preferences);
    return {
      status: 'ok',
      preferences: updatedPreferences,
    };
  }
}
