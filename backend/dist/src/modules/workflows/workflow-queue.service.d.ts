import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { AppConfig } from '../../config/env.validation';
import IORedis from 'ioredis';
interface DeliverPayload {
    executionId: string;
    workspaceId: string;
}
export declare class WorkflowQueueService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private readonly connection;
    private readonly deliverQueue;
    private readonly scheduler;
    constructor(config: ConfigService<AppConfig, true>);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    enqueueDeliver(payload: DeliverPayload): Promise<string>;
    getQueue(): Queue<DeliverPayload>;
    getConnection(): IORedis;
}
export {};
