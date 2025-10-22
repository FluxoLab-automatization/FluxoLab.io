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
export declare class WorkflowNodesService {
    private readonly nodeTemplates;
    private readonly nodeCategories;
    private readonly triggerTypes;
    getNodeTemplates(): Promise<NodeTemplate[]>;
    getNodeCategories(): Promise<NodeCategory[]>;
    getTriggerTypes(): Promise<TriggerType[]>;
    getNodeConfigSchema(nodeType: string): Promise<any>;
    validateNode(nodeData: any): Promise<NodeValidation>;
    testNode(testData: any): Promise<NodeTestResult>;
}
