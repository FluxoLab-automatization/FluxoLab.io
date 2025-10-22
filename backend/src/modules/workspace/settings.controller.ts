import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import {
  WorkspaceSettingsService,
  type WorkspaceSettingsSummary,
} from './workspace-settings.service';
import { UsageAnalyticsService } from './services/usage-analytics.service';
import { PlanManagementService } from './services/plan-management.service';
import { WorkspaceApiKeysService } from './services/workspace-api-keys.service';
import { WorkspaceIntegrationsService } from './services/workspace-integrations.service';
import { UsageHistoryQueryDto } from './dto/usage-history.dto';
import { UpgradePlanDto, CancelSubscriptionDto } from './dto/plan-management.dto';
import {
  ConfigureLdapDto,
  ConfigureLogDestinationDto,
  ConfigureSsoDto,
  CreateApiKeyDto,
  CreateUsageAlertDto,
  UpdateEnvironmentStatusDto,
  UpdateProfileDto,
  UpdateSecuritySettingsDto,
} from './dto/settings-requests.dto';

@Controller('api/settings')
export class SettingsController {
  constructor(
    private readonly workspaceSettingsService: WorkspaceSettingsService,
    private readonly usageAnalyticsService: UsageAnalyticsService,
    private readonly planManagementService: PlanManagementService,
    private readonly apiKeysService: WorkspaceApiKeysService,
    private readonly integrationsService: WorkspaceIntegrationsService,
  ) {}

  /** Garante workspaceId como string e lança 422 se ausente */
  private requireWorkspaceId(user: AuthenticatedUser): string {
    const id = user.workspaceId ?? null;
    if (!id) {
      // você pode trocar para ConflictException (409) se preferir semântica de seleção pendente
      throw new UnprocessableEntityException(
        'Workspace não definido para este usuário. Crie ou selecione um workspace padrão e tente novamente.',
      );
    }
    return id;
  }

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  async getSettingsSummary(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ status: 'ok'; summary: WorkspaceSettingsSummary }> {
    // Se seu summary exige workspace, você pode forçar aqui:
    // const workspaceId = this.requireWorkspaceId(user);
    const summary = await this.workspaceSettingsService.getSummary(user);
    return {
      status: 'ok',
      summary,
    };
  }

  // Usage Analytics Endpoints
  @UseGuards(JwtAuthGuard)
  @Get('usage/history')
  async getUsageHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: UsageHistoryQueryDto,
  ) {
    const workspaceId = this.requireWorkspaceId(user);
    const history = await this.usageAnalyticsService.getUsageHistory(
      workspaceId,
      query,
    );
    return {
      status: 'ok',
      data: history,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('usage/alerts')
  async getUsageAlerts(@CurrentUser() user: AuthenticatedUser) {
    const workspaceId = this.requireWorkspaceId(user);
    const alerts = await this.usageAnalyticsService.getUsageAlerts(workspaceId);
    return {
      status: 'ok',
      alerts,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('usage/alerts')
  async createUsageAlert(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: CreateUsageAlertDto,
  ) {
    const workspaceId = this.requireWorkspaceId(user);
    const alert = await this.usageAnalyticsService.createUsageAlert(
      workspaceId,
      {
        metric: payload.metric,
        threshold: payload.threshold,
        condition: payload.condition,
        window: payload.window,
        channel: payload.channel,
        enabled: payload.enabled,
        metadata: payload.metadata ?? {},
        createdBy: user.id,
      },
    );
    return {
      status: 'ok',
      alert,
    };
  }

  // Plan Management Endpoints
  @UseGuards(JwtAuthGuard)
  @Get('plans/available')
  async getAvailablePlans() {
    const plans = await this.planManagementService.getAvailablePlans();
    return {
      status: 'ok',
      plans,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('plans/upgrade')
  async upgradePlan(
    @CurrentUser() user: AuthenticatedUser,
    @Body() upgradeData: UpgradePlanDto,
  ) {
    const workspaceId = this.requireWorkspaceId(user);
    const result = await this.planManagementService.upgradePlan(
      workspaceId,
      upgradeData,
    );
    return {
      status: 'ok',
      ...result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('billing/cancel')
  async cancelSubscription(
    @CurrentUser() user: AuthenticatedUser,
    @Body() cancelData: CancelSubscriptionDto,
  ) {
    const workspaceId = this.requireWorkspaceId(user);
    const result = await this.planManagementService.cancelSubscription(
      workspaceId,
      cancelData,
    );
    return {
      status: 'ok',
      ...result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('billing/history')
  async getBillingHistory(@CurrentUser() user: AuthenticatedUser) {
    const workspaceId = this.requireWorkspaceId(user);
    const history =
      await this.planManagementService.getBillingHistory(workspaceId);
    return {
      status: 'ok',
      history,
    };
  }

  // Integration Endpoints
  @UseGuards(JwtAuthGuard)
  @Get('integrations/status')
  async getIntegrationsStatus(@CurrentUser() user: AuthenticatedUser) {
    const workspaceId = this.requireWorkspaceId(user);
    const integrations = await this.integrationsService.getStatus(workspaceId);
    return {
      status: 'ok',
      integrations,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('environments/:environmentId/status')
  async setEnvironmentStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('environmentId') environmentId: string,
    @Body() payload: UpdateEnvironmentStatusDto,
  ) {
    const workspaceId = this.requireWorkspaceId(user);
    const updated = await this.integrationsService.updateEnvironmentStatus({
      workspaceId,
      environmentId,
      status: payload.status,
    });

    if (!updated) {
      throw new NotFoundException('Ambiente nao encontrado para este workspace.');
    }

    return {
      status: 'ok',
      environment: updated,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('sso/configure')
  async configureSso(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: ConfigureSsoDto,
  ) {
    const workspaceId = this.requireWorkspaceId(user);
    await this.integrationsService.configureSso({
      workspaceId,
      provider: payload.provider,
      clientId: payload.clientId,
      clientSecret: payload.clientSecret,
      enabled: payload.enabled,
      recordedBy: user.id,
    });

    return {
      status: 'ok',
      message: 'SSO configuration updated successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('ldap/configure')
  async configureLdap(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: ConfigureLdapDto,
  ) {
    const workspaceId = this.requireWorkspaceId(user);
    await this.integrationsService.configureLdap({
      workspaceId,
      host: payload.host,
      baseDn: payload.baseDn,
      port: payload.port,
      bindDn: payload.bindDn,
      bindPassword: payload.bindPassword,
      enabled: payload.enabled,
      recordedBy: user.id,
    });

    return {
      status: 'ok',
      message: 'LDAP configuration updated successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logs/configure')
  async configureLogDestination(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: ConfigureLogDestinationDto,
  ) {
    const workspaceId = this.requireWorkspaceId(user);
    await this.integrationsService.configureLogDestination({
      workspaceId,
      destination: payload.destination,
      endpoint: payload.endpoint,
      apiKey: payload.apiKey,
      enabled: payload.enabled,
      recordedBy: user.id,
    });

    return {
      status: 'ok',
      message: 'Log destination updated successfully',
    };
  }

  // Personal Settings Endpoints
  @UseGuards(JwtAuthGuard)
  @Put('personal/profile')
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() _profileData: UpdateProfileDto,
  ) {
    // Se precisar do workspace aqui também:
    // const workspaceId = this.requireWorkspaceId(user);
    return {
      status: 'ok',
      message: 'Profile updated successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('personal/security')
  async updateSecuritySettings(
    @CurrentUser() user: AuthenticatedUser,
    @Body() _securityData: UpdateSecuritySettingsDto,
  ) {
    return {
      status: 'ok',
      message: 'Security settings updated successfully',
    };
  }

  // API Management Endpoints
  @UseGuards(JwtAuthGuard)
  @Post('api/keys')
  async createApiKey(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: CreateApiKeyDto,
  ) {
    const workspaceId = this.requireWorkspaceId(user);
    const { token, key } = await this.apiKeysService.createKey({
      workspaceId,
      label: payload.label ?? 'Chave API',
      scopes: payload.scopes ?? [],
      createdBy: user.id,
      expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null,
      metadata: payload.metadata ?? {},
    });
    return {
      status: 'ok',
      token,
      key,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('api/keys/:id')
  async revokeApiKey(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') keyId: string,
  ) {
    const workspaceId = this.requireWorkspaceId(user);
    await this.apiKeysService.revokeKey({
      workspaceId,
      apiKeyId: keyId,
      actorId: user.id,
    });
    return {
      status: 'ok',
      message: 'API key revoked successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/keys/:id/usage')
  async getApiKeyUsage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') keyId: string,
  ) {
    const workspaceId = this.requireWorkspaceId(user);
    const usage = await this.apiKeysService.getKeyUsage(workspaceId, keyId);
    return {
      status: 'ok',
      usage,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put('api/keys/:id/rotate')
  async rotateApiKey(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') keyId: string,
  ) {
    const workspaceId = this.requireWorkspaceId(user);
    const { token } = await this.apiKeysService.rotateKey({
      workspaceId,
      apiKeyId: keyId,
      actorId: user.id,
    });
    return {
      status: 'ok',
      token,
    };
  }
}
