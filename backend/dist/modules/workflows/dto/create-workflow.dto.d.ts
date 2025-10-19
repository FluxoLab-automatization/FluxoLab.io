declare class WorkflowNodeDto {
    id: string;
    type: string;
    name?: string;
    params?: Record<string, unknown>;
}
declare class WorkflowConnectionDto {
    from: string;
    to: string;
    output?: string;
}
export declare class WorkflowDefinitionDto {
    nodes: WorkflowNodeDto[];
    connections: WorkflowConnectionDto[];
}
export declare class CreateWorkflowDto {
    name: string;
    definition: WorkflowDefinitionDto;
    tags?: string[];
}
export {};
