import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { WorkflowQueueService } from './workflow-queue.service';
import { WorkflowExecutionsService } from './workflow-executions.service';
import { WorkflowWebhookService } from './workflow-webhook.service';
import { WorkflowEngineService } from './workflow-engine.service';
export declare class WorkflowRunnerService implements OnModuleInit, OnModuleDestroy {
    private readonly queueService;
    private readonly executionsService;
    private readonly webhookService;
    private readonly engine;
    private readonly logger;
    private worker?;
    constructor(queueService: WorkflowQueueService, executionsService: WorkflowExecutionsService, webhookService: WorkflowWebhookService, engine: WorkflowEngineService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
