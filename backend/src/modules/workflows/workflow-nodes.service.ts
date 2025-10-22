import { Injectable } from '@nestjs/common';

export interface NodeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  type: string;
  inputs: number;
  outputs: number;
  configSchema: any;
  defaultConfig: any;
}

export interface NodeCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
}

export interface TriggerType {
  id: string;
  name: string;
  description: string;
  icon: string;
  configSchema: any;
  defaultConfig: any;
}

export interface NodeValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface NodeTestResult {
  success: boolean;
  output?: any;
  error?: string;
  logs?: string[];
}

@Injectable()
export class WorkflowNodesService {
  private readonly nodeTemplates: NodeTemplate[] = [
    // AI Nodes
    {
      id: 'ai-agent',
      name: 'AI Agent',
      description: 'Build autonomous agents, summarize or search documents, etc.',
      category: 'ai',
      icon: 'ai',
      type: 'ai-agent',
      inputs: 1,
      outputs: 1,
      configSchema: {
        type: 'object',
        properties: {
          prompt: { type: 'string', title: 'Prompt' },
          model: { type: 'string', title: 'Model' },
          temperature: { type: 'number', title: 'Temperature', minimum: 0, maximum: 2 },
          maxTokens: { type: 'number', title: 'Max Tokens' },
        },
        required: ['prompt'],
      },
      defaultConfig: {
        prompt: '',
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 1000,
      },
    },
    {
      id: 'ai-summarize',
      name: 'AI Summarize',
      description: 'Summarize text content using AI',
      category: 'ai',
      icon: 'ai',
      type: 'ai-summarize',
      inputs: 1,
      outputs: 1,
      configSchema: {
        type: 'object',
        properties: {
          maxLength: { type: 'number', title: 'Max Length' },
          style: { type: 'string', title: 'Style', enum: ['bullet', 'paragraph', 'list'] },
        },
        required: ['maxLength'],
      },
      defaultConfig: {
        maxLength: 200,
        style: 'bullet',
      },
    },

    // Action Nodes
    {
      id: 'http-request',
      name: 'HTTP Request',
      description: 'Make HTTP requests to external APIs',
      category: 'action',
      icon: 'action',
      type: 'http-request',
      inputs: 1,
      outputs: 1,
      configSchema: {
        type: 'object',
        properties: {
          url: { type: 'string', title: 'URL' },
          method: { type: 'string', title: 'Method', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
          headers: { type: 'object', title: 'Headers' },
          body: { type: 'string', title: 'Body' },
        },
        required: ['url', 'method'],
      },
      defaultConfig: {
        url: '',
        method: 'GET',
        headers: {},
        body: '',
      },
    },
    {
      id: 'email-send',
      name: 'Send Email',
      description: 'Send emails using SMTP or email service',
      category: 'action',
      icon: 'action',
      type: 'email-send',
      inputs: 1,
      outputs: 1,
      configSchema: {
        type: 'object',
        properties: {
          to: { type: 'string', title: 'To' },
          subject: { type: 'string', title: 'Subject' },
          body: { type: 'string', title: 'Body' },
          from: { type: 'string', title: 'From' },
        },
        required: ['to', 'subject', 'body'],
      },
      defaultConfig: {
        to: '',
        subject: '',
        body: '',
        from: '',
      },
    },

    // Data Transformation Nodes
    {
      id: 'data-transform',
      name: 'Data Transform',
      description: 'Transform and manipulate data',
      category: 'data',
      icon: 'data',
      type: 'data-transform',
      inputs: 1,
      outputs: 1,
      configSchema: {
        type: 'object',
        properties: {
          transformation: { type: 'string', title: 'Transformation Code' },
          outputFormat: { type: 'string', title: 'Output Format', enum: ['json', 'csv', 'xml'] },
        },
        required: ['transformation'],
      },
      defaultConfig: {
        transformation: 'return data;',
        outputFormat: 'json',
      },
    },
    {
      id: 'data-filter',
      name: 'Data Filter',
      description: 'Filter data based on conditions',
      category: 'data',
      icon: 'data',
      type: 'data-filter',
      inputs: 1,
      outputs: 1,
      configSchema: {
        type: 'object',
        properties: {
          condition: { type: 'string', title: 'Filter Condition' },
          operator: { type: 'string', title: 'Operator', enum: ['equals', 'contains', 'greater', 'less', 'regex'] },
          value: { type: 'string', title: 'Value' },
        },
        required: ['condition', 'operator'],
      },
      defaultConfig: {
        condition: '',
        operator: 'equals',
        value: '',
      },
    },

    // Flow Control Nodes
    {
      id: 'if-condition',
      name: 'If Condition',
      description: 'Branch workflow based on conditions',
      category: 'flow',
      icon: 'flow',
      type: 'if-condition',
      inputs: 1,
      outputs: 2,
      configSchema: {
        type: 'object',
        properties: {
          condition: { type: 'string', title: 'Condition' },
          operator: { type: 'string', title: 'Operator', enum: ['equals', 'not_equals', 'greater', 'less', 'contains'] },
          value: { type: 'string', title: 'Value' },
        },
        required: ['condition', 'operator'],
      },
      defaultConfig: {
        condition: '',
        operator: 'equals',
        value: '',
      },
    },
    {
      id: 'merge',
      name: 'Merge',
      description: 'Merge multiple data streams',
      category: 'flow',
      icon: 'flow',
      type: 'merge',
      inputs: 2,
      outputs: 1,
      configSchema: {
        type: 'object',
        properties: {
          mergeStrategy: { type: 'string', title: 'Merge Strategy', enum: ['combine', 'replace', 'append'] },
        },
        required: ['mergeStrategy'],
      },
      defaultConfig: {
        mergeStrategy: 'combine',
      },
    },

    // Core Nodes
    {
      id: 'code-execute',
      name: 'Code Execute',
      description: 'Execute custom code (JavaScript, Python)',
      category: 'core',
      icon: 'core',
      type: 'code-execute',
      inputs: 1,
      outputs: 1,
      configSchema: {
        type: 'object',
        properties: {
          language: { type: 'string', title: 'Language', enum: ['javascript', 'python'] },
          code: { type: 'string', title: 'Code' },
        },
        required: ['language', 'code'],
      },
      defaultConfig: {
        language: 'javascript',
        code: 'return data;',
      },
    },
    {
      id: 'webhook',
      name: 'Webhook',
      description: 'Receive HTTP requests as workflow triggers',
      category: 'core',
      icon: 'core',
      type: 'webhook',
      inputs: 0,
      outputs: 1,
      configSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', title: 'Path' },
          method: { type: 'string', title: 'Method', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
          authentication: { type: 'string', title: 'Authentication', enum: ['none', 'basic', 'bearer', 'api-key'] },
          respondMode: { type: 'string', title: 'Respond Mode', enum: ['immediately', 'when_complete', 'never'] },
        },
        required: ['path', 'method'],
      },
      defaultConfig: {
        path: '',
        method: 'POST',
        authentication: 'none',
        respondMode: 'immediately',
      },
    },

    // Human in the Loop
    {
      id: 'approval',
      name: 'Approval',
      description: 'Wait for human approval before continuing',
      category: 'human',
      icon: 'human',
      type: 'approval',
      inputs: 1,
      outputs: 1,
      configSchema: {
        type: 'object',
        properties: {
          message: { type: 'string', title: 'Approval Message' },
          approvers: { type: 'array', title: 'Approvers', items: { type: 'string' } },
          timeout: { type: 'number', title: 'Timeout (hours)' },
        },
        required: ['message'],
      },
      defaultConfig: {
        message: 'Please approve this workflow step',
        approvers: [],
        timeout: 24,
      },
    },
  ];

  private readonly nodeCategories: NodeCategory[] = [
    {
      id: 'ai',
      name: 'AI',
      description: 'Build autonomous agents, summarize or search documents, etc.',
      icon: 'ai',
      order: 1,
    },
    {
      id: 'action',
      name: 'Action in an app',
      description: 'Do something in an app or service like Google Sheets, Telegram or Notion',
      icon: 'action',
      order: 2,
    },
    {
      id: 'data',
      name: 'Data transformation',
      description: 'Manipulate, filter or convert data',
      icon: 'data',
      order: 3,
    },
    {
      id: 'flow',
      name: 'Flow',
      description: 'Branch, merge or loop the flow, etc.',
      icon: 'flow',
      order: 4,
    },
    {
      id: 'core',
      name: 'Core',
      description: 'Run code, make HTTP requests, set webhooks, etc.',
      icon: 'core',
      order: 5,
    },
    {
      id: 'human',
      name: 'Human in the loop',
      description: 'Wait for approval or human input before continuing',
      icon: 'human',
      order: 6,
    },
  ];

  private readonly triggerTypes: TriggerType[] = [
    {
      id: 'manual',
      name: 'Trigger manually',
      description: 'Runs the flow on clicking a button in FluxoLab. Good for getting started quickly',
      icon: 'manual',
      configSchema: {
        type: 'object',
        properties: {},
      },
      defaultConfig: {},
    },
    {
      id: 'schedule',
      name: 'On a schedule',
      description: 'Runs the flow every day, hour, or custom interval',
      icon: 'schedule',
      configSchema: {
        type: 'object',
        properties: {
          interval: { type: 'string', title: 'Interval', enum: ['minute', 'hour', 'day', 'week', 'month'] },
          value: { type: 'number', title: 'Value' },
          timezone: { type: 'string', title: 'Timezone' },
        },
        required: ['interval', 'value'],
      },
      defaultConfig: {
        interval: 'hour',
        value: 1,
        timezone: 'UTC',
      },
    },
    {
      id: 'webhook',
      name: 'On webhook call',
      description: 'Runs the flow on receiving an HTTP request',
      icon: 'webhook',
      configSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', title: 'Path' },
          method: { type: 'string', title: 'Method', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
          authentication: { type: 'string', title: 'Authentication', enum: ['none', 'basic', 'bearer', 'api-key'] },
        },
        required: ['path', 'method'],
      },
      defaultConfig: {
        path: '',
        method: 'POST',
        authentication: 'none',
      },
    },
    {
      id: 'form',
      name: 'On form submission',
      description: 'Generate webforms in FluxoLab and pass their responses to the workflow',
      icon: 'form',
      configSchema: {
        type: 'object',
        properties: {
          formName: { type: 'string', title: 'Form Name' },
          fields: { type: 'array', title: 'Form Fields', items: { type: 'object' } },
        },
        required: ['formName'],
      },
      defaultConfig: {
        formName: '',
        fields: [],
      },
    },
  ];

  async getNodeTemplates(): Promise<NodeTemplate[]> {
    return this.nodeTemplates;
  }

  async getNodeCategories(): Promise<NodeCategory[]> {
    return this.nodeCategories.sort((a, b) => a.order - b.order);
  }

  async getTriggerTypes(): Promise<TriggerType[]> {
    return this.triggerTypes;
  }

  async getNodeConfigSchema(nodeType: string): Promise<any> {
    const template = this.nodeTemplates.find(t => t.type === nodeType);
    if (!template) {
      throw new Error(`Node type ${nodeType} not found`);
    }
    return template.configSchema;
  }

  async validateNode(nodeData: any): Promise<NodeValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!nodeData.type) {
      errors.push('Node type is required');
    }

    if (!nodeData.name || nodeData.name.trim() === '') {
      errors.push('Node name is required');
    }

    // Find template for validation
    const template = this.nodeTemplates.find(t => t.type === nodeData.type);
    if (template) {
      // Validate required fields
      const requiredFields = Object.keys(template.configSchema.properties).filter(
        key => template.configSchema.required?.includes(key)
      );

      for (const field of requiredFields) {
        if (!nodeData.config || !nodeData.config[field]) {
          errors.push(`Required field '${field}' is missing`);
        }
      }

      // Validate field types
      if (nodeData.config) {
        for (const [key, value] of Object.entries(nodeData.config)) {
          const fieldSchema = template.configSchema.properties[key];
          if (fieldSchema) {
            if (fieldSchema.type === 'number' && typeof value !== 'number') {
              errors.push(`Field '${key}' must be a number`);
            } else if (fieldSchema.type === 'string' && typeof value !== 'string') {
              errors.push(`Field '${key}' must be a string`);
            } else if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
              errors.push(`Field '${key}' must be one of: ${fieldSchema.enum.join(', ')}`);
            }
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async testNode(testData: any): Promise<NodeTestResult> {
    try {
      // Mock test execution - in real implementation, this would execute the node
      const { nodeType, config, inputData } = testData;

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful result
      return {
        success: true,
        output: {
          message: `Node ${nodeType} executed successfully`,
          processedData: inputData,
          timestamp: new Date().toISOString(),
        },
        logs: [
          `Starting execution of ${nodeType}`,
          `Configuration: ${JSON.stringify(config)}`,
          `Execution completed successfully`,
        ],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        logs: [
          `Error executing node: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      };
    }
  }
}
