import { Body, Controller, Post, Param, UseGuards, Get, Put, Delete, Query } from '@nestjs/common';
import { createHash } from 'crypto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireWorkspaceGuard } from '../auth/require-workspace.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { WorkflowsService } from './workflows.service';
import { WorkflowExecutionsService } from './workflow-executions.service';
import { WorkflowEngineService } from './workflow-engine.service';
import { WorkflowCredentialsService } from './workflow-credentials.service';
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
    private readonly credentials: WorkflowCredentialsService,
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
        position: node.position,
        ports: node.ports?.map((port) => ({
          id: port.id,
          kind: port.kind,
          label: port.label,
          alignment: port.alignment,
        })),
        style: node.style,
      })),
      connections: payload.definition.connections.map((conn) => ({
        id: conn.id,
        from: conn.from,
        to: conn.to,
        output: conn.output,
        label: conn.label,
        variant: conn.variant,
        fromPort: conn.fromPort,
        toPort: conn.toPort,
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
  @Get()
  async listWorkflows(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const workspaceId = user.workspaceId as string;
    const workflows = await this.workflows.listWorkflows(workspaceId, {
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });

    return {
      status: 'ok',
      workflows,
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Get('credentials')
  async getCredentials(@CurrentUser() user: AuthenticatedUser) {
    const workspaceId = user.workspaceId as string;
    const credentials = await this.credentials.listCredentials(workspaceId);
    return {
      status: 'ok',
      credentials,
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Get(':workflowId')
  async getWorkflow(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workflowId') workflowId: string,
  ) {
    const workspaceId = user.workspaceId as string;
    const workflow = await this.workflows.getWorkflow(workspaceId, workflowId);
    const activeVersion = await this.workflows.getActiveVersion(workspaceId, workflowId);

    return {
      status: 'ok',
      workflow: {
        ...workflow,
        definition: activeVersion.definition,
        version: activeVersion.version,
      },
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Put(':workflowId')
  async updateWorkflow(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workflowId') workflowId: string,
    @Body() payload: Partial<CreateWorkflowDto>,
  ) {
    const workspaceId = user.workspaceId as string;
    
    if (payload.definition) {
      const definition: WorkflowDefinition = {
        nodes: payload.definition.nodes.map((node) => ({
          id: node.id,
          type: node.type,
          name: node.name,
          params: node.params ?? {},
          position: node.position,
          ports: node.ports?.map((port) => ({
            id: port.id,
            kind: port.kind,
            label: port.label,
            alignment: port.alignment,
          })),
          style: node.style,
        })),
        connections: payload.definition.connections.map((conn) => ({
          id: conn.id,
          from: conn.from,
          to: conn.to,
          output: conn.output,
          label: conn.label,
          variant: conn.variant,
          fromPort: conn.fromPort,
          toPort: conn.toPort,
        })),
      };

      const version = await this.workflows.createVersion({
        workflowId,
        definition,
        checksum: checksum(definition),
        createdBy: user.id,
      });

      await this.workflows.activateVersion(workspaceId, workflowId, version.id);
    }

    const updatedWorkflow = await this.workflows.updateWorkflow(workspaceId, workflowId, {
      name: payload.name,
      tags: payload.tags,
    });

    return {
      status: 'ok',
      workflow: updatedWorkflow,
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Delete(':workflowId')
  async deleteWorkflow(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workflowId') workflowId: string,
  ) {
    const workspaceId = user.workspaceId as string;
    await this.workflows.deleteWorkflow(workspaceId, workflowId);

    return {
      status: 'ok',
      message: 'Workflow deleted successfully',
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Get(':workflowId/executions')
  async listWorkflowExecutions(
    @CurrentUser() user: AuthenticatedUser,
    @Param('workflowId') workflowId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const workspaceId = user.workspaceId as string;
    const executions = await this.executions.listExecutions(workspaceId, workflowId, {
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });

    return {
      status: 'ok',
      executions,
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

