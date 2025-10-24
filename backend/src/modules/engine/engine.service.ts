import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { v4 as uuidv4 } from 'uuid';
import { Execution, ExecutionStep, Workflow, WorkflowVersion } from '../../shared/entities';
import { SystemEvent, IdempotencyKey, DistributedLock, RetryQueue } from './entities';
import { EventProcessor } from './processors/event.processor';
import { WorkflowProcessor } from './processors/workflow.processor';
import { HumanTaskProcessor } from './processors/human-task.processor';
import { EvidenceProcessor } from './processors/evidence.processor';
import { UsageProcessor } from './processors/usage.processor';
import { AuditProcessor } from './processors/audit.processor';

@Injectable()
export class EngineService {
  private readonly logger = new Logger(EngineService.name);

  constructor(
    @InjectRepository(Execution)
    private executionRepository: Repository<Execution>,
    @InjectRepository(ExecutionStep)
    private executionStepRepository: Repository<ExecutionStep>,
    @InjectRepository(Workflow)
    private workflowRepository: Repository<Workflow>,
    @InjectRepository(WorkflowVersion)
    private workflowVersionRepository: Repository<WorkflowVersion>,
    @InjectRepository(SystemEvent)
    private systemEventRepository: Repository<SystemEvent>,
    @InjectRepository(IdempotencyKey)
    private idempotencyKeyRepository: Repository<IdempotencyKey>,
    @InjectRepository(DistributedLock)
    private distributedLockRepository: Repository<DistributedLock>,
    @InjectRepository(RetryQueue)
    private retryQueueRepository: Repository<RetryQueue>,
    @InjectQueue('events')
    private eventsQueue: Queue,
    @InjectQueue('workflows')
    private workflowsQueue: Queue,
    @InjectQueue('human-tasks')
    private humanTasksQueue: Queue,
    @InjectQueue('evidence')
    private evidenceQueue: Queue,
    @InjectQueue('usage')
    private usageQueue: Queue,
    @InjectQueue('audit')
    private auditQueue: Queue,
    private eventProcessor: EventProcessor,
    private workflowProcessor: WorkflowProcessor,
    private humanTaskProcessor: HumanTaskProcessor,
    private evidenceProcessor: EvidenceProcessor,
    private usageProcessor: UsageProcessor,
    private auditProcessor: AuditProcessor,
  ) {}

  /**
   * Inicia execução de workflow
   */
  async startWorkflowExecution(
    workflowId: string,
    triggerData: any,
    context: {
      tenantId: string;
      workspaceId: string;
      userId?: string;
      correlationId?: string;
      traceId?: string;
    }
  ): Promise<string> {
    const runId = uuidv4();
    const correlationId = context.correlationId || uuidv4();
    const traceId = context.traceId || uuidv4();

    try {
      // Buscar workflow e versão ativa
      const workflow = await this.workflowRepository.findOne({
        where: { id: workflowId, workspaceId: context.workspaceId },
        relations: ['activeVersion']
      });

      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      if (!workflow.activeVersion) {
        throw new Error(`No active version for workflow ${workflowId}`);
      }

      // Criar execução
      const execution = this.executionRepository.create({
        id: runId,
        workflowId,
        workspaceId: context.workspaceId,
        tenantId: context.tenantId,
        status: 'queued',
        triggerData,
        correlationId,
        traceId,
        startedAt: new Date(),
      });

      await this.executionRepository.save(execution);

      // Emitir evento de início
      await this.emitEvent('flx.run.started', {
        runId,
        workflowId,
        workspaceId: context.workspaceId,
        tenantId: context.tenantId,
        correlationId,
        traceId,
        triggerData
      });

      // Adicionar à fila de processamento
      await this.workflowsQueue.add('process-workflow', {
        runId,
        workflowId,
        versionId: workflow.activeVersion.id,
        triggerData,
        context
      });

      this.logger.log(`Workflow execution started: ${runId}`);
      return runId;

    } catch (error) {
      this.logger.error(`Failed to start workflow execution: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Processa execução de workflow
   */
  async processWorkflowExecution(
    runId: string,
    workflowId: string,
    versionId: string,
    triggerData: any,
    context: any
  ): Promise<void> {
    try {
      // Buscar execução
      const execution = await this.executionRepository.findOne({
        where: { id: runId },
        relations: ['workflow', 'workflow.activeVersion']
      });

      if (!execution) {
        throw new Error(`Execution ${runId} not found`);
      }

      // Atualizar status para running
      execution.status = 'running';
      await this.executionRepository.save(execution);

      // Emitir evento
      await this.emitEvent('flx.run.running', {
        runId,
        workflowId,
        workspaceId: context.workspaceId,
        tenantId: context.tenantId,
        correlationId: context.correlationId,
        traceId: context.traceId
      });

      // Buscar versão do workflow
      const version = await this.workflowVersionRepository.findOne({
        where: { id: versionId },
        relations: ['nodes', 'edges']
      });

      if (!version) {
        throw new Error(`Workflow version ${versionId} not found`);
      }

      // Processar nós do workflow
      await this.workflowProcessor.processWorkflowNodes(
        runId,
        version,
        triggerData,
        context
      );

    } catch (error) {
      this.logger.error(`Failed to process workflow execution: ${error.message}`, error.stack);
      
      // Atualizar status para failed
      await this.executionRepository.update(runId, {
        status: 'failed',
        finishedAt: new Date(),
        errorMessage: error.message
      });

      // Emitir evento de falha
      await this.emitEvent('flx.run.failed', {
        runId,
        workflowId,
        workspaceId: context.workspaceId,
        tenantId: context.tenantId,
        correlationId: context.correlationId,
        traceId: context.traceId,
        error: error.message
      });
    }
  }

  /**
   * Processa nó individual
   */
  async processNode(
    runId: string,
    nodeId: string,
    nodeData: any,
    inputData: any,
    context: any
  ): Promise<any> {
    try {
      // Criar step de execução
      const step = this.executionStepRepository.create({
        id: uuidv4(),
        executionId: runId,
        nodeId,
        nodeName: nodeData.name,
        nodeType: nodeData.type,
        status: 'running',
        inputItems: inputData,
        startedAt: new Date(),
      });

      await this.executionStepRepository.save(step);

      // Emitir evento de início do step
      await this.emitEvent('flx.step.started', {
        runId,
        stepId: step.id,
        nodeId,
        nodeType: nodeData.type,
        workspaceId: context.workspaceId,
        tenantId: context.tenantId,
        correlationId: context.correlationId,
        traceId: context.traceId
      });

      let outputData: any;

      // Processar baseado no tipo do nó
      switch (nodeData.type) {
        case 'webhook':
          outputData = await this.processWebhookNode(nodeData, inputData, context);
          break;
        case 'connector':
          outputData = await this.processConnectorNode(nodeData, inputData, context);
          break;
        case 'ai':
          outputData = await this.processAiNode(nodeData, inputData, context);
          break;
        case 'human_task':
          outputData = await this.processHumanTaskNode(nodeData, inputData, context);
          break;
        case 'transform':
          outputData = await this.processTransformNode(nodeData, inputData, context);
          break;
        case 'condition':
          outputData = await this.processConditionNode(nodeData, inputData, context);
          break;
        default:
          throw new Error(`Unknown node type: ${nodeData.type}`);
      }

      // Atualizar step com sucesso
      step.status = 'succeeded';
      step.outputItems = outputData;
      step.finishedAt = new Date();
      await this.executionStepRepository.save(step);

      // Emitir evento de sucesso
      await this.emitEvent('flx.step.succeeded', {
        runId,
        stepId: step.id,
        nodeId,
        nodeType: nodeData.type,
        workspaceId: context.workspaceId,
        tenantId: context.tenantId,
        correlationId: context.correlationId,
        traceId: context.traceId,
        outputData
      });

      return outputData;

    } catch (error) {
      this.logger.error(`Failed to process node ${nodeId}: ${error.message}`, error.stack);
      
      // Atualizar step com falha
      await this.executionStepRepository.update(
        { executionId: runId, nodeId },
        {
          status: 'failed',
          finishedAt: new Date(),
          errorMessage: error.message
        }
      );

      // Emitir evento de falha
      await this.emitEvent('flx.step.failed', {
        runId,
        nodeId,
        nodeType: nodeData.type,
        workspaceId: context.workspaceId,
        tenantId: context.tenantId,
        correlationId: context.correlationId,
        traceId: context.traceId,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Processa nó de webhook
   */
  private async processWebhookNode(nodeData: any, inputData: any, context: any): Promise<any> {
    // Implementar lógica de webhook
    return { success: true, data: inputData };
  }

  /**
   * Processa nó de conector
   */
  private async processConnectorNode(nodeData: any, inputData: any, context: any): Promise<any> {
    // Implementar lógica de conector
    return { success: true, data: inputData };
  }

  /**
   * Processa nó de IA
   */
  private async processAiNode(nodeData: any, inputData: any, context: any): Promise<any> {
    // Implementar lógica de IA
    return { success: true, data: inputData };
  }

  /**
   * Processa nó de tarefa humana
   */
  private async processHumanTaskNode(nodeData: any, inputData: any, context: any): Promise<any> {
    // Implementar lógica de tarefa humana
    return { success: true, data: inputData };
  }

  /**
   * Processa nó de transformação
   */
  private async processTransformNode(nodeData: any, inputData: any, context: any): Promise<any> {
    // Implementar lógica de transformação
    return { success: true, data: inputData };
  }

  /**
   * Processa nó de condição
   */
  private async processConditionNode(nodeData: any, inputData: any, context: any): Promise<any> {
    // Implementar lógica de condição
    return { success: true, data: inputData };
  }

  /**
   * Emite evento do sistema
   */
  async emitEvent(eventType: string, payload: any): Promise<void> {
    try {
      const event = this.systemEventRepository.create({
        eventType,
        tenantId: payload.tenantId,
        workspaceId: payload.workspaceId,
        runId: payload.runId,
        correlationId: payload.correlationId,
        traceId: payload.traceId,
        payload,
        checksum: this.calculateChecksum(payload)
      });

      await this.systemEventRepository.save(event);

      // Adicionar à fila de processamento de eventos
      await this.eventsQueue.add('process-event', {
        eventId: event.id,
        eventType,
        payload
      });

    } catch (error) {
      this.logger.error(`Failed to emit event ${eventType}: ${error.message}`, error.stack);
    }
  }

  /**
   * Calcula checksum dos dados
   */
  private calculateChecksum(data: any): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  /**
   * Verifica idempotência
   */
  async checkIdempotency(
    tenantId: string,
    workspaceId: string,
    scope: string,
    key: string
  ): Promise<boolean> {
    const existing = await this.idempotencyKeyRepository.findOne({
      where: { tenantId, workspaceId, scope, key }
    });

    return existing !== null;
  }

  /**
   * Cria chave de idempotência
   */
  async createIdempotencyKey(
    tenantId: string,
    workspaceId: string,
    scope: string,
    key: string,
    runId: string,
    expiresAt: Date
  ): Promise<void> {
    const idempotencyKey = this.idempotencyKeyRepository.create({
      tenantId,
      workspaceId,
      scope,
      key,
      runId,
      expiresAt
    });

    await this.idempotencyKeyRepository.save(idempotencyKey);
  }

  /**
   * Adquire lock distribuído
   */
  async acquireLock(lockKey: string, lockedBy: string, ttlSeconds: number): Promise<boolean> {
    try {
      const lock = this.distributedLockRepository.create({
        lockKey,
        lockedBy,
        expiresAt: new Date(Date.now() + ttlSeconds * 1000)
      });

      await this.distributedLockRepository.save(lock);
      return true;
    } catch (error) {
      // Lock já existe
      return false;
    }
  }

  /**
   * Libera lock distribuído
   */
  async releaseLock(lockKey: string, lockedBy: string): Promise<void> {
    await this.distributedLockRepository.delete({
      lockKey,
      lockedBy
    });
  }

  /**
   * Adiciona item à fila de retry
   */
  async addToRetryQueue(
    runId: string,
    stepId: string,
    errorMessage: string,
    maxRetries: number = 3
  ): Promise<void> {
    const retryItem = this.retryQueueRepository.create({
      runId,
      stepId,
      errorMessage,
      maxRetries,
      nextRetryAt: new Date(Date.now() + 60000) // 1 minuto
    });

    await this.retryQueueRepository.save(retryItem);
  }

  /**
   * Processa fila de retry
   */
  async processRetryQueue(): Promise<void> {
    const retryItems = await this.retryQueueRepository.find({
      where: {
        nextRetryAt: { $lte: new Date() }
      }
    });

    for (const item of retryItems) {
      if (item.retryCount >= item.maxRetries) {
        // Remover da fila após esgotar tentativas
        await this.retryQueueRepository.delete(item.id);
        continue;
      }

      // Incrementar contador de retry
      item.retryCount += 1;
      item.nextRetryAt = new Date(Date.now() + Math.pow(2, item.retryCount) * 60000); // Backoff exponencial
      await this.retryQueueRepository.save(item);

      // Reprocessar step
      await this.workflowsQueue.add('retry-step', {
        runId: item.runId,
        stepId: item.stepId
      });
    }
  }
}
