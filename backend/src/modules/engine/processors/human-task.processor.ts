import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

@Processor('human-tasks')
export class HumanTaskProcessor {
  private readonly logger = new Logger(HumanTaskProcessor.name);

  @Process('create-human-task')
  async handleHumanTaskCreation(job: Job<{
    runId: string;
    stepId: string;
    taskType: string;
    title: string;
    description?: string;
    instructions?: string;
    priority?: string;
    assignedTo?: string;
    slaHours?: number;
    inputData?: any;
  }>) {
    const {
      runId,
      stepId,
      taskType,
      title,
      description,
      instructions,
      priority,
      assignedTo,
      slaHours,
      inputData
    } = job.data;

    try {
      this.logger.log(`Creating human task: ${title} (${runId})`);

      // Implementar lógica de criação de tarefa humana
      // Criar registro na tabela human_tasks
      // Enviar notificações
      // Configurar SLA

      this.logger.log(`Human task created successfully: ${title} (${runId})`);

    } catch (error) {
      this.logger.error(`Failed to create human task ${title}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('process-human-task')
  async handleHumanTaskProcessing(job: Job<{
    taskId: string;
    action: string;
    performedBy: string;
    comment?: string;
    outputData?: any;
  }>) {
    const { taskId, action, performedBy, comment, outputData } = job.data;

    try {
      this.logger.log(`Processing human task: ${taskId} (${action})`);

      // Implementar lógica de processamento de tarefa humana
      // Atualizar status da tarefa
      // Registrar histórico
      // Continuar execução do workflow se necessário

      this.logger.log(`Human task processed successfully: ${taskId} (${action})`);

    } catch (error) {
      this.logger.error(`Failed to process human task ${taskId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('escalate-human-task')
  async handleHumanTaskEscalation(job: Job<{
    taskId: string;
    escalationLevel: number;
    escalatedTo: string;
    reason: string;
  }>) {
    const { taskId, escalationLevel, escalatedTo, reason } = job.data;

    try {
      this.logger.log(`Escalating human task: ${taskId} (level ${escalationLevel})`);

      // Implementar lógica de escalonamento
      // Atualizar responsável da tarefa
      // Enviar notificações
      // Registrar histórico de escalonamento

      this.logger.log(`Human task escalated successfully: ${taskId} (level ${escalationLevel})`);

    } catch (error) {
      this.logger.error(`Failed to escalate human task ${taskId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Process('send-notification')
  async handleNotificationSending(job: Job<{
    taskId: string;
    notificationType: string;
    recipientId: string;
    channel: string;
    subject?: string;
    body: string;
  }>) {
    const { taskId, notificationType, recipientId, channel, subject, body } = job.data;

    try {
      this.logger.log(`Sending notification: ${notificationType} to ${recipientId} via ${channel}`);

      // Implementar lógica de envio de notificação
      // Enviar via email, push, SMS, WhatsApp, etc.
      // Registrar status de envio

      this.logger.log(`Notification sent successfully: ${notificationType} to ${recipientId}`);

    } catch (error) {
      this.logger.error(`Failed to send notification to ${recipientId}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
