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
var McpToolsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpToolsService = void 0;
const common_1 = require("@nestjs/common");
const mcp_client_service_1 = require("./mcp-client.service");
let McpToolsService = McpToolsService_1 = class McpToolsService {
    mcpClient;
    logger = new common_1.Logger(McpToolsService_1.name);
    constructor(mcpClient) {
        this.mcpClient = mcpClient;
    }
    async executeWorkflowStep(stepId, context) {
        try {
            const result = await this.mcpClient.callTool('execute_workflow_step', {
                stepId,
                context,
            });
            return {
                success: true,
                output: result,
                metadata: {
                    stepId,
                    executedAt: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            this.logger.error(`Failed to execute workflow step ${stepId}`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                metadata: {
                    stepId,
                    failedAt: new Date().toISOString(),
                },
            };
        }
    }
    async generateWorkflowCode(description, language = 'javascript') {
        try {
            const result = await this.mcpClient.callTool('generate_code', {
                description,
                language,
                type: 'workflow',
            });
            return result.code || result;
        }
        catch (error) {
            this.logger.error('Failed to generate workflow code', error);
            throw error;
        }
    }
    async analyzeWorkflow(workflowDefinition) {
        try {
            const result = await this.mcpClient.callTool('analyze_workflow', {
                definition: workflowDefinition,
            });
            return {
                complexity: result.complexity || 'medium',
                estimatedExecutionTime: result.estimatedExecutionTime || 0,
                potentialIssues: result.potentialIssues || [],
                recommendations: result.recommendations || [],
                dependencies: result.dependencies || [],
            };
        }
        catch (error) {
            this.logger.error('Failed to analyze workflow', error);
            throw error;
        }
    }
    async validateWorkflow(workflowDefinition) {
        try {
            const result = await this.mcpClient.callTool('validate_workflow', {
                definition: workflowDefinition,
            });
            return {
                isValid: result.isValid || false,
                errors: result.errors || [],
                warnings: result.warnings || [],
            };
        }
        catch (error) {
            this.logger.error('Failed to validate workflow', error);
            return {
                isValid: false,
                errors: [error instanceof Error ? error.message : 'Validation failed'],
                warnings: [],
            };
        }
    }
    async optimizeWorkflow(workflowDefinition) {
        try {
            const result = await this.mcpClient.callTool('optimize_workflow', {
                definition: workflowDefinition,
            });
            return {
                optimized: result.optimized || workflowDefinition,
                improvements: result.improvements || [],
                performanceGains: result.performanceGains || {},
            };
        }
        catch (error) {
            this.logger.error('Failed to optimize workflow', error);
            throw error;
        }
    }
    async generateDocumentation(workflowDefinition) {
        try {
            const result = await this.mcpClient.callTool('generate_documentation', {
                definition: workflowDefinition,
                format: 'markdown',
            });
            return result.documentation || result;
        }
        catch (error) {
            this.logger.error('Failed to generate documentation', error);
            throw error;
        }
    }
    async simulateWorkflow(workflowDefinition, inputs) {
        try {
            const result = await this.mcpClient.callTool('simulate_workflow', {
                definition: workflowDefinition,
                inputs,
            });
            return {
                outputs: result.outputs || {},
                executionPath: result.executionPath || [],
                performance: result.performance || {
                    totalTime: 0,
                    stepTimes: {},
                },
            };
        }
        catch (error) {
            this.logger.error('Failed to simulate workflow', error);
            throw error;
        }
    }
    async suggestWorkflowImprovements(workflowDefinition) {
        try {
            const result = await this.mcpClient.callTool('suggest_improvements', {
                definition: workflowDefinition,
            });
            return {
                suggestions: result.suggestions || [],
            };
        }
        catch (error) {
            this.logger.error('Failed to suggest workflow improvements', error);
            throw error;
        }
    }
    async generateTests(workflowDefinition) {
        try {
            const result = await this.mcpClient.callTool('generate_tests', {
                definition: workflowDefinition,
            });
            return {
                unitTests: result.unitTests || '',
                integrationTests: result.integrationTests || '',
                testData: result.testData || {},
            };
        }
        catch (error) {
            this.logger.error('Failed to generate tests', error);
            throw error;
        }
    }
    async createWorkflowTemplate(category, requirements) {
        try {
            const result = await this.mcpClient.callTool('create_template', {
                category,
                requirements,
            });
            return result.template || result;
        }
        catch (error) {
            this.logger.error('Failed to create workflow template', error);
            throw error;
        }
    }
    async migrateWorkflow(fromVersion, toVersion, workflowDefinition) {
        try {
            const result = await this.mcpClient.callTool('migrate_workflow', {
                fromVersion,
                toVersion,
                definition: workflowDefinition,
            });
            return result.migrated || workflowDefinition;
        }
        catch (error) {
            this.logger.error('Failed to migrate workflow', error);
            throw error;
        }
    }
};
exports.McpToolsService = McpToolsService;
exports.McpToolsService = McpToolsService = McpToolsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mcp_client_service_1.McpClient])
], McpToolsService);
//# sourceMappingURL=mcp-tools.service.js.map