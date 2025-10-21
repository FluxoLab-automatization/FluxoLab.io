import type { Queue } from 'bull';
export declare class LeadsService {
    private readonly workflowsQueue;
    constructor(workflowsQueue: Queue);
    captureLead(payload: Record<string, any>): Promise<void>;
}
