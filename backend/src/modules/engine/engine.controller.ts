import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { EngineService } from './engine.service';
import { StartWorkflowDto, ProcessNodeDto, CreateHumanTaskDto, ProcessHumanTaskDto } from './dto';

@Controller('api/engine')
@UseGuards(JwtAuthGuard)
export class EngineController {
  constructor(private readonly engineService: EngineService) {}

  @Post('workflows/:workflowId/start')
  async startWorkflow(
    @Param('workflowId') workflowId: string,
    @Body() startWorkflowDto: StartWorkflowDto
  ) {
    const runId = await this.engineService.startWorkflowExecution(
      workflowId,
      startWorkflowDto.triggerData,
      {
        tenantId: startWorkflowDto.tenantId,
        workspaceId: startWorkflowDto.workspaceId,
        userId: startWorkflowDto.userId,
        correlationId: startWorkflowDto.correlationId,
        traceId: startWorkflowDto.traceId
      }
    );

    return { runId, status: 'started' };
  }

  @Post('nodes/process')
  async processNode(@Body() processNodeDto: ProcessNodeDto) {
    const result = await this.engineService.processNode(
      processNodeDto.runId,
      processNodeDto.nodeId,
      processNodeDto.nodeData,
      processNodeDto.inputData,
      processNodeDto.context
    );

    return { result };
  }

  @Post('human-tasks')
  async createHumanTask(@Body() createHumanTaskDto: CreateHumanTaskDto) {
    // Implementar criação de tarefa humana
    return { message: 'Human task created successfully' };
  }

  @Post('human-tasks/:taskId/process')
  async processHumanTask(
    @Param('taskId') taskId: string,
    @Body() processHumanTaskDto: ProcessHumanTaskDto
  ) {
    // Implementar processamento de tarefa humana
    return { message: 'Human task processed successfully' };
  }

  @Get('events')
  async getEvents(
    @Query('eventType') eventType?: string,
    @Query('workspaceId') workspaceId?: string,
    @Query('runId') runId?: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0
  ) {
    // Implementar busca de eventos
    return { events: [], total: 0 };
  }

  @Get('executions/:runId/status')
  async getExecutionStatus(@Param('runId') runId: string) {
    // Implementar busca de status de execução
    return { runId, status: 'running' };
  }

  @Get('executions/:runId/evidence')
  async getExecutionEvidence(@Param('runId') runId: string) {
    // Implementar busca de evidências de execução
    return { runId, evidence: {} };
  }

  @Post('retry/:runId/:stepId')
  async retryStep(
    @Param('runId') runId: string,
    @Param('stepId') stepId: string
  ) {
    await this.engineService.addToRetryQueue(runId, stepId, 'Manual retry');
    return { message: 'Step added to retry queue' };
  }

  @Post('locks/acquire')
  async acquireLock(
    @Body() body: { lockKey: string; lockedBy: string; ttlSeconds: number }
  ) {
    const acquired = await this.engineService.acquireLock(
      body.lockKey,
      body.lockedBy,
      body.ttlSeconds
    );
    return { acquired };
  }

  @Post('locks/release')
  async releaseLock(
    @Body() body: { lockKey: string; lockedBy: string }
  ) {
    await this.engineService.releaseLock(body.lockKey, body.lockedBy);
    return { message: 'Lock released' };
  }

  @Get('health')
  async getHealth() {
    return { status: 'healthy', timestamp: new Date().toISOString() };
  }
}
