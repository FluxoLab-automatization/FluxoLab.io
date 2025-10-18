interface PendingResponder {
    resolve: (status: number, body: unknown) => void;
    reject: (error: Error) => void;
}
export declare class WorkflowResponseRegistry {
    private readonly responders;
    register(correlationId: string, hooks: PendingResponder): void;
    consume(correlationId: string): PendingResponder | null;
}
export {};
