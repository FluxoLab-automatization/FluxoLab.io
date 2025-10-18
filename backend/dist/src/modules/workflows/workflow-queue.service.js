"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WorkflowQueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowQueueService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
let WorkflowQueueService = WorkflowQueueService_1 = class WorkflowQueueService {
    logger = new common_1.Logger(WorkflowQueueService_1.name);
    connection;
    deliverQueue;
    scheduler;
    constructor(config) {
        const redisUrl = config.get('REDIS_URL', { infer: true }) ?? 'redis://localhost:6379';
        this.connection = new ioredis_1.default(redisUrl, {
            maxRetriesPerRequest: null,
        });
        this.deliverQueue = new bullmq_1.Queue('workflow:deliver', {
            connection: this.connection,
        });
        this.scheduler = new bullmq_1.QueueScheduler('workflow:deliver', {
            connection: this.connection,
        });
    }
    async onModuleInit() {
        await this.scheduler.waitUntilReady();
        this.logger.log('Workflow queue scheduler ready');
    }
    async onModuleDestroy() {
        await Promise.all([this.deliverQueue.close(), this.scheduler.close(), this.connection.quit()]);
    }
    async enqueueDeliver(payload) {
        const job = await this.deliverQueue.add('deliver', payload, {
            removeOnComplete: true,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
        });
        return job.id;
    }
    getQueue() {
        return this.deliverQueue;
    }
    getConnection() {
        return this.connection;
    }
};
exports.WorkflowQueueService = WorkflowQueueService;
exports.WorkflowQueueService = WorkflowQueueService = WorkflowQueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WorkflowQueueService);
//# sourceMappingURL=workflow-queue.service.js.map