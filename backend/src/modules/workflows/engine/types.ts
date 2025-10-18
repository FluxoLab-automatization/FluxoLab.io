export interface WorkflowItem {
  json: Record<string, unknown>;
  binary?: Record<string, unknown>;
}

export interface WorkflowNodeDefinition {
  id: string;
  type: string;
  name?: string;
  params?: Record<string, unknown>;
}

export interface WorkflowConnectionDefinition {
  from: string;
  to: string;
  output?: string; // e.g. 'true'/'false'
}

export interface WorkflowRuntimeContext {
  workspaceId: string;
  workflowId: string;
  executionId: string;
  correlationId?: string | null;
}

export interface NodeHandlerResult {
  itemsByOutput: Record<string, WorkflowItem[]>;
}

export interface NodeHandler {
  readonly type: string;
  execute(
    node: WorkflowNodeDefinition,
    input: WorkflowItem[],
    ctx: WorkflowRuntimeContext & {
      params: Record<string, unknown>;
      getCredential<T = Record<string, unknown>>(id: string): Promise<T>;
      log(message: string, metadata?: Record<string, unknown>): void;
      respond?(status: number, payload: unknown): Promise<void>;
    },
  ): Promise<NodeHandlerResult>;
}

export interface WorkflowDefinition {
  nodes: WorkflowNodeDefinition[];
  connections: WorkflowConnectionDefinition[];
}
