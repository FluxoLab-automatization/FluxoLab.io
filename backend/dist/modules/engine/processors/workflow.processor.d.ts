import { Job } from 'bull';
import { EngineService } from '../engine.service';
export declare class WorkflowProcessor {
    private engineService;
    private readonly logger;
    constructor(engineService: EngineService);
    handleWorkflowProcessing(job: Job<{
        runId: string;
        workflowId: string;
        versionId: string;
        triggerData: any;
        context: any;
    }>): Promise<void>;
    handleStepRetry(job: Job<{
        runId: string;
        stepId: string;
    }>): Promise<void>;
    handleWorkflowNodesProcessing(job: Job<{
        runId: string;
        version: any;
        triggerData: any;
        context: any;
    }>): Promise<void>;
}
