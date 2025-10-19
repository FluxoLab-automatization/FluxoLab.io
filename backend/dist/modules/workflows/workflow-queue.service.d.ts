import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JobsOptions, Queue } from 'bullmq';
import { AppConfig } from '../../config/env.validation';
import IORedis from 'ioredis';
export interface DeliverPayload {
    executionId: string;
    workspaceId: string;
}
export declare class WorkflowQueueService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private readonly connection;
    private readonly deliverQueue;
    private readonly deliverEvents;
    private readonly enabled;
    constructor(config: ConfigService<AppConfig, true>);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    enqueueDeliver(payload: DeliverPayload, opts?: JobsOptions): Promise<string>;
    getQueue(): Queue<DeliverPayload> | null;
    getConnection(): IORedis | null;
}
