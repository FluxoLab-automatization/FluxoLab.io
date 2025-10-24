import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EngineService } from '../engine.service';

@Processor('workflows')
export class WorkflowProcessor {
  private readonly logger = new Logger(WorkflowProcessor.name);

  constructor(private engineService: EngineService) {}

  @Process('process-workflow')
  async handleWorkflowProcessing(job: Job<{
    runId: string;
    workflowId: string;
    versionId: string;
    triggerData: any;
    context: any;
  }>) {
    const { runId, workflowId, versionId, triggerData, context } = job.data;

    try {
      this.logger.log(`Processing workflow: ${workflowId} (${runId})`);

      await this.engineService.processWorkflowExecution(
        runId,
        workflowId,
        versionId,
        triggerData,
        context
      );

      this.logger.log(`Workflow processed successfully: ${workflowId} (${runId})`);

    } catch (error) {
      this.logger.error(`Failed to process workflow ${workflowId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('retry-step')
  async handleStepRetry(job: Job<{ runId: string; stepId: string }>) {
    const { runId, stepId } = job.data;

    try {
      this.logger.log(`Retrying step: ${stepId} (${runId})`);

      // Implementar lógica de retry de step
      // Buscar dados do step e reprocessar

      this.logger.log(`Step retry completed: ${stepId} (${runId})`);

    } catch (error) {
      this.logger.error(`Failed to retry step ${stepId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('process-workflow-nodes')
  async handleWorkflowNodesProcessing(job: Job<{
    runId: string;
    version: any;
    triggerData: any;
    context: any;
  }>) {
    const { runId, version, triggerData, context } = job.data;

    try {
      this.logger.log(`Processing workflow nodes: ${runId}`);

      // Implementar lógica de processamento de nós
      // Percorrer nós do workflow e processar sequencialmente ou em paralelo

      this.logger.log(`Workflow nodes processed successfully: ${runId}`);

    } catch (error) {
      this.logger.error(`Failed to process workflow nodes ${runId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async processWorkflowNodes(
    runId: string,
    version: any,
    triggerData: any,
    context: any
  ): Promise<void> {
    try {
      this.logger.log(`Processing workflow nodes: ${runId}`);

      // Implementar lógica de processamento de nós
      // Percorrer nós do workflow e processar sequencialmente ou em paralelo
      if (version.nodes && Array.isArray(version.nodes)) {
        for (const node of version.nodes) {
          await this.engineService.processNode(
            runId,
            node.id,
            node,
            triggerData,
            context
          );
        }
      }

      this.logger.log(`Workflow nodes processed successfully: ${runId}`);

    } catch (error) {
      this.logger.error(`Failed to process workflow nodes ${runId}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
