import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireWorkspaceGuard } from '../auth/require-workspace.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { WorkflowCredentialsService } from './workflow-credentials.service';
import { CreateCredentialDto } from './dto/create-credential.dto';

@UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
@Controller('api/workflows/credentials')
export class WorkflowCredentialsController {
  constructor(private readonly credentialsService: WorkflowCredentialsService) {}

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser) {
    const workspaceId = user.workspaceId as string;
    const credentials = await this.credentialsService.listCredentials(workspaceId);
    return {
      status: 'ok',
      credentials,
    };
  }

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: CreateCredentialDto,
  ) {
    const workspaceId = user.workspaceId as string;
    const secret = payload.secret ?? {};
    const credential = await this.credentialsService.createCredential({
      workspaceId,
      name: payload.name,
      type: payload.type,
      secret,
      createdBy: user.id,
    });

    return {
      status: 'created',
      credential: {
        id: credential.id,
        name: credential.name,
        type: credential.type,
        createdAt: credential.createdAt,
      },
    };
  }
}

