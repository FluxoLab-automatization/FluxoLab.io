import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JobsOptions, Queue, QueueEvents } from 'bullmq';
import { AppConfig } from '../../config/env.validation';
import IORedis from 'ioredis';

export interface DeliverPayload {
  executionId: string;
  workspaceId: string;
}

@Injectable()
export class WorkflowQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WorkflowQueueService.name);
  private readonly connection: IORedis | null;
  private readonly deliverQueue: Queue<DeliverPayload> | null;
  private readonly deliverEvents: QueueEvents | null;
  private readonly enabled: boolean;

  constructor(config: ConfigService<AppConfig, true>) {
    const redisUrl =
      config.get('REDIS_URL', { infer: true }) ?? 'redis://localhost:6379';
    const isTest = process.env.NODE_ENV === 'test';
    this.enabled = !isTest && Boolean(redisUrl);

    if (!this.enabled) {
      this.connection = null;
      this.deliverQueue = null;
      this.deliverEvents = null;
      return;
    }

    this.connection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
    });

    this.deliverQueue = new Queue<DeliverPayload>('workflow-deliver', {
      connection: this.connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 1000,
      },
    });

    this.deliverEvents = new QueueEvents('workflow-deliver', {
      connection: this.connection,
    });

    this.deliverEvents.on('failed', ({ jobId, failedReason }) => {
      this.logger.warn(`deliver job ${jobId} failed: ${failedReason}`);
    });

    this.deliverEvents.on('completed', ({ jobId }) => {
      this.logger.debug(`deliver job ${jobId} completed`);
    });
  }

  async onModuleInit(): Promise<void> {
    if (!this.enabled) {
      this.logger.log('Workflow queue disabled in current environment');
      return;
    }
    try {
      const pong = await this.connection!.ping();
      this.logger.log(`Redis ping: ${pong}`);
    } catch (error) {
      this.logger.error('Redis ping failed', error as Error);
    }
    this.logger.log('Workflow queue ready (BullMQ v4+)');
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.enabled) {
      return;
    }
    await Promise.all([
      this.deliverEvents?.close(),
      this.deliverQueue?.close(),
      this.connection?.quit(),
    ]);
  }

  async enqueueDeliver(
    payload: DeliverPayload,
    opts?: JobsOptions,
  ): Promise<string> {
    if (!this.enabled || !this.deliverQueue) {
      this.logger.debug('Queue disabled, skipping enqueue', payload);
      return 'inline-execution';
    }
    const job = await this.deliverQueue.add('deliver', payload, opts);
    return job.id as string;
  }

  getQueue(): Queue<DeliverPayload> | null {
    return this.deliverQueue;
  }

  getConnection(): IORedis | null {
    return this.connection;
  }
}
