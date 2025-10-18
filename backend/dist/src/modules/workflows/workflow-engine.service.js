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
var WorkflowEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowEngineService = void 0;
const common_1 = require("@nestjs/common");
const workflows_service_1 = require("./workflows.service");
const workflow_credentials_service_1 = require("./workflow-credentials.service");
const workflow_executions_service_1 = require("./workflow-executions.service");
const workflow_response_registry_1 = require("./workflow-response.registry");
const node_registry_1 = require("./engine/node-registry");
const workflow_webhook_service_1 = require("./workflow-webhook.service");
const workflow_queue_service_1 = require("./workflow-queue.service");
let WorkflowEngineService = WorkflowEngineService_1 = class WorkflowEngineService {
    workflowsService;
    credentialsService;
    executionsService;
    responseRegistry;
    webhookService;
    queueService;
    logger = new common_1.Logger(WorkflowEngineService_1.name);
    constructor(workflowsService, credentialsService, executionsService, responseRegistry, webhookService, queueService) {
        this.workflowsService = workflowsService;
        this.credentialsService = credentialsService;
        this.executionsService = executionsService;
        this.responseRegistry = responseRegistry;
        this.webhookService = webhookService;
        this.queueService = queueService;
    }
    async enqueueExecution(executionId, workspaceId) {
        await this.queueService.enqueueDeliver({ executionId, workspaceId });
    }
    async runInline(options) {
        const version = await this.workflowsService.getActiveVersion(options.workspaceId, options.workflowId);
        await this.executionsService.markRunning(options.executionId);
        try {
            await this.executeDefinition(version, options);
            await this.executionsService.markFinished(options.executionId, 'succeeded');
        }
        catch (error) {
            this.logger.error('Workflow execution failed', error instanceof Error ? error.stack : undefined);
            await this.executionsService.markFinished(options.executionId, 'failed', {
                message: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }
    async executeDefinition(version, options) {
        const { definition } = version;
        const nodes = new Map((definition.nodes ?? []).map((node) => [String(node.id), node]));
        const connections = (definition.connections ?? []).map((conn) => ({
            from: String(conn.from),
            to: String(conn.to),
            output: conn.output ? String(conn.output) : 'default',
        }));
        const queue = [];
        const itemsByNode = new Map();
        const startNodes = this.resolveStartNodes(nodes, connections);
        if (startNodes.length === 0) {
            return;
        }
        itemsByNode.set(startNodes[0], options.initialItems);
        queue.push(startNodes[0]);
        while (queue.length > 0) {
            const nodeId = queue.shift();
            const node = nodes.get(nodeId);
            if (!node) {
                continue;
            }
            const handler = (0, node_registry_1.resolveNodeHandler)(node.type);
            if (!handler) {
                this.logger.warn(`No handler registered for node type ${node.type}`);
                continue;
            }
            const items = itemsByNode.get(nodeId) ?? [];
            if (!items.length) {
                continue;
            }
            await this.executionsService.appendStep({
                executionId: options.executionId,
                nodeId,
                nodeName: node.name ?? node.type,
                status: 'running',
                attempt: 1,
                inputItems: items,
            });
            const ctx = {
                workspaceId: options.workspaceId,
                workflowId: options.workflowId,
                executionId: options.executionId,
                correlationId: options.correlationId ?? null,
                params: node.params ?? {},
                getCredential: (id) => this.credentialsService.getCredential(options.workspaceId, id),
                log: (message, metadata) => this.logger.debug({
                    executionId: options.executionId,
                    nodeId,
                    message,
                    metadata,
                }),
                respond: options.correlationId && node.type === 'webhook.respond'
                    ? async (status, payload) => {
                        const responder = this.responseRegistry.consume(options.correlationId);
                        if (responder) {
                            responder.resolve(status, payload);
                        }
                        else {
                            this.logger.warn(`No pending HTTP responder for correlation ${options.correlationId}`);
                        }
                    }
                    : undefined,
            };
            const result = await handler.execute(node, items, ctx);
            await this.executionsService.appendStep({
                executionId: options.executionId,
                nodeId,
                nodeName: node.name ?? node.type,
                status: 'succeeded',
                attempt: 1,
                inputItems: items,
                outputItems: result.itemsByOutput,
            });
            const outgoing = connections.filter((conn) => conn.from === nodeId);
            for (const connection of outgoing) {
                const nextItems = result.itemsByOutput[connection.output ?? 'default'] ??
                    result.itemsByOutput.default ??
                    [];
                if (!nextItems.length) {
                    continue;
                }
                const existing = itemsByNode.get(connection.to) ?? [];
                itemsByNode.set(connection.to, existing.concat(nextItems));
                if (!queue.includes(connection.to)) {
                    queue.push(connection.to);
                }
            }
        }
    }
    resolveStartNodes(nodes, connections) {
        const hasIncoming = new Map();
        for (const nodeId of nodes.keys()) {
            hasIncoming.set(nodeId, false);
        }
        for (const connection of connections) {
            hasIncoming.set(connection.to, true);
        }
        const start = Array.from(nodes.keys()).filter((nodeId) => !hasIncoming.get(nodeId));
        if (start.length === 0) {
            const first = nodes.keys().next().value;
            return first ? [first] : [];
        }
        return start;
    }
};
exports.WorkflowEngineService = WorkflowEngineService;
exports.WorkflowEngineService = WorkflowEngineService = WorkflowEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [workflows_service_1.WorkflowsService,
        workflow_credentials_service_1.WorkflowCredentialsService,
        workflow_executions_service_1.WorkflowExecutionsService,
        workflow_response_registry_1.WorkflowResponseRegistry,
        workflow_webhook_service_1.WorkflowWebhookService,
        workflow_queue_service_1.WorkflowQueueService])
], WorkflowEngineService);
//# sourceMappingURL=workflow-engine.service.js.map