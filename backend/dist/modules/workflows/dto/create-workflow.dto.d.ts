declare class WorkflowNodePositionDto {
    x: number;
    y: number;
}
declare class WorkflowNodePortDto {
    id: string;
    kind: 'input' | 'output';
    label?: string;
    alignment?: 'left' | 'right' | 'top' | 'bottom';
}
declare class WorkflowNodeStyleDto {
    icon?: string;
    accent?: string;
    variant?: 'default' | 'success' | 'warning' | 'info';
    status?: 'ready' | 'inactive' | 'error';
}
declare class WorkflowNodeDto {
    id: string;
    type: string;
    name?: string;
    params?: Record<string, unknown>;
    position?: WorkflowNodePositionDto;
    ports?: WorkflowNodePortDto[];
    style?: WorkflowNodeStyleDto;
}
declare class WorkflowConnectionDto {
    id?: string;
    from: string;
    to: string;
    output?: string;
    label?: string;
    variant?: 'solid' | 'dashed';
    fromPort?: string;
    toPort?: string;
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
