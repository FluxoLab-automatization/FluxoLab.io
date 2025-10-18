import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, QueueScheduler } from 'bullmq';
import { AppConfig } from '../../config/env.validation';
import IORedis from 'ioredis';

export interface DeliverPayload {
  executionId: string;
  workspaceId: string;
}

@Injectable()
export class WorkflowQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WorkflowQueueService.name);
  private readonly connection: IORedis;
  private readonly deliverQueue: Queue<DeliverPayload>;
  private readonly scheduler: QueueScheduler;

  constructor(config: ConfigService<AppConfig, true>) {
    const redisUrl =
      config.get('REDIS_URL', { infer: true }) ?? 'redis://localhost:6379';
    this.connection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
    });

    this.deliverQueue = new Queue<DeliverPayload>('workflow:deliver', {
      connection: this.connection,
    });

    this.scheduler = new QueueScheduler('workflow:deliver', {
      connection: this.connection,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.scheduler.waitUntilReady();
    this.logger.log('Workflow queue scheduler ready');
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all([this.deliverQueue.close(), this.scheduler.close(), this.connection.quit()]);
  }

  async enqueueDeliver(payload: DeliverPayload): Promise<string> {
    const job = await this.deliverQueue.add('deliver', payload, {
      removeOnComplete: true,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
    return job.id as string;
  }

  getQueue(): Queue<DeliverPayload> {
    return this.deliverQueue;
  }

  getConnection(): IORedis {
    return this.connection;
  }
}
