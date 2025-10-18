import { Body, Controller, Post, Param, UseGuards } from '@nestjs/common';
import { createHash } from 'crypto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireWorkspaceGuard } from '../auth/require-workspace.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { WorkflowsService } from './workflows.service';
import { WorkflowExecutionsService } from './workflow-executions.service';
import { WorkflowEngineService } from './workflow-engine.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { WorkflowDefinition } from './engine/types';

function checksum(definition: unknown): string {
  return createHash('sha256').update(JSON.stringify(definition)).digest('hex');
}

@Controller('api/workflows')
export class WorkflowsController {
  constructor(
    private readonly workflows: WorkflowsService,
    private readonly executions: WorkflowExecutionsService,
    private readonly engine: WorkflowEngineService,
  ) {}

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Post()
  async createWorkflow(
    @CurrentUser() user: AuthenticatedUser,
    @Body() payload: CreateWorkflowDto,
  ) {
    const workspaceId = user.workspaceId as string;
    const definition: WorkflowDefinition = {
      nodes: payload.definition.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        name: node.name,
        params: node.params ?? {},
      })),
      connections: payload.definition.connections.map((conn) => ({
        from: conn.from,
        to: conn.to,
        output: conn.output,
      })),
    };

    const workflow = await this.workflows.createWorkflow({
      workspaceId,
      name: payload.name,
      createdBy: user.id,
      tags: payload.tags,
    });

    const version = await this.workflows.createVersion({
      workflowId: workflow.id,
      definition,
      checksum: checksum(definition),
      createdBy: user.id,
    });

    await this.workflows.activateVersion(workspaceId, workflow.id, version.id);

    return {
      status: 'created',
      workflow: {
        id: workflow.id,
        version: version.version,
      },
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Post(':workflowId/test')
  async executeWorkflow(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workflowId') workflowId: string,
    @Body() body: Record<string, unknown>,
  ) {
    const workspaceId = user.workspaceId as string;
    const activeVersion = await this.workflows.getActiveVersion(workspaceId, workflowId);
    const execution = await this.executions.createExecution({
      workspaceId,
      workflowId,
      workflowVersionId: activeVersion.id,
    });

    await this.engine.runInline({
      workspaceId,
      workflowId,
      executionId: execution.id,
      initialItems: [{ json: body }],
    });

    return {
      status: 'ok',
      executionId: execution.id,
    };
  }
}

