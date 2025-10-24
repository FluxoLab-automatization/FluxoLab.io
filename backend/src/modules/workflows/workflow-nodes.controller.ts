import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireWorkspaceGuard } from '../auth/require-workspace.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { WorkflowNodesService } from './workflow-nodes.service';

@Controller('api/workflows/nodes')
export class WorkflowNodesController {
  constructor(private readonly workflowNodesService: WorkflowNodesService) {}

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Get('templates')
  async getNodeTemplates(@CurrentUser() user: AuthenticatedUser) {
    const templates = await this.workflowNodesService.getNodeTemplates();
    return {
      status: 'ok',
      templates,
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Get('categories')
  async getNodeCategories(@CurrentUser() user: AuthenticatedUser) {
    const categories = await this.workflowNodesService.getNodeCategories();
    return {
      status: 'ok',
      categories,
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Get('triggers')
  async getTriggerTypes(@CurrentUser() user: AuthenticatedUser) {
    const triggers = await this.workflowNodesService.getTriggerTypes();
    return {
      status: 'ok',
      triggers,
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Post('validate')
  async validateNode(
    @CurrentUser() user: AuthenticatedUser,
    @Body() nodeData: any,
  ) {
    const validation = await this.workflowNodesService.validateNode(nodeData);
    return {
      status: 'ok',
      validation,
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Post('test')
  async testNode(
    @CurrentUser() user: AuthenticatedUser,
    @Body() testData: any,
  ) {
    const result = await this.workflowNodesService.testNode(testData);
    return {
      status: 'ok',
      result,
    };
  }

  @UseGuards(JwtAuthGuard, RequireWorkspaceGuard)
  @Get('config-schema/:nodeType')
  async getNodeConfigSchema(
    @CurrentUser() user: AuthenticatedUser,
    @Param('nodeType') nodeType: string,
  ) {
    const schema = await this.workflowNodesService.getNodeConfigSchema(nodeType);
    return {
      status: 'ok',
      schema,
    };
  }
}

