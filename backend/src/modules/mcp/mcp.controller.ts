import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { McpService } from './mcp.service';
import { McpClient } from './mcp-client.service';

@Controller('api/mcp')
@UseGuards(JwtAuthGuard)
export class McpController {
  constructor(
    private readonly mcpService: McpService,
    private readonly mcpClient: McpClient,
  ) {}

  @Get('status')
  async getStatus() {
    const isAvailable = this.mcpService.isMcpAvailable();
    const serverUrl = this.mcpClient.getServerUrl();
    
    return {
      status: 'ok',
      available: isAvailable,
      serverUrl,
      connected: this.mcpClient.isConnected(),
    };
  }

  @Get('tools')
  async getTools() {
    const tools = await this.mcpService.getAvailableTools();
    return {
      status: 'ok',
      tools,
    };
  }

  @Get('resources')
  async getResources() {
    const resources = await this.mcpService.getAvailableResources();
    return {
      status: 'ok',
      resources,
    };
  }

  @Get('prompts')
  async getPrompts() {
    const prompts = await this.mcpService.getAvailablePrompts();
    return {
      status: 'ok',
      prompts,
    };
  }

  @Post('tools/:toolName/call')
  async callTool(
    @Param('toolName') toolName: string,
    @Body() body: { arguments: Record<string, any> },
  ) {
    const result = await this.mcpService.callTool(toolName, body.arguments);
    return {
      status: 'ok',
      result,
    };
  }

  @Post('resources/read')
  async readResource(@Body() body: { uri: string }) {
    const content = await this.mcpService.readResource(body.uri);
    return {
      status: 'ok',
      content,
    };
  }

  @Post('prompts/:promptName')
  async getPrompt(
    @Param('promptName') promptName: string,
    @Body() body: { arguments: Record<string, any> },
  ) {
    const prompt = await this.mcpService.getPrompt(promptName, body.arguments);
    return {
      status: 'ok',
      prompt,
    };
  }

  // FluxoLab-specific endpoints
  @Post('workflows/execute-step')
  async executeWorkflowStep(@Body() body: { stepId: string; context: Record<string, any> }) {
    const result = await this.mcpService.executeWorkflowStep(body.stepId, body.context);
    return {
      status: 'ok',
      result,
    };
  }

  @Post('workflows/generate-code')
  async generateWorkflowCode(@Body() body: { description: string; language?: string }) {
    const code = await this.mcpService.generateWorkflowCode(body.description, body.language);
    return {
      status: 'ok',
      code,
    };
  }

  @Post('workflows/analyze')
  async analyzeWorkflow(@Body() body: { definition: any }) {
    const analysis = await this.mcpService.analyzeWorkflow(body.definition);
    return {
      status: 'ok',
      analysis,
    };
  }

  @Post('workflows/validate')
  async validateWorkflow(@Body() body: { definition: any }) {
    const validation = await this.mcpService.validateWorkflow(body.definition);
    return {
      status: 'ok',
      validation,
    };
  }

  @Post('workflows/optimize')
  async optimizeWorkflow(@Body() body: { definition: any }) {
    const optimization = await this.mcpService.optimizeWorkflow(body.definition);
    return {
      status: 'ok',
      optimization,
    };
  }

  @Post('workflows/documentation')
  async generateDocumentation(@Body() body: { definition: any }) {
    const documentation = await this.mcpService.generateDocumentation(body.definition);
    return {
      status: 'ok',
      documentation,
    };
  }

  @Post('workflows/simulate')
  async simulateWorkflow(@Body() body: { definition: any; inputs: Record<string, any> }) {
    const simulation = await this.mcpService.simulateWorkflow(body.definition, body.inputs);
    return {
      status: 'ok',
      simulation,
    };
  }
}
