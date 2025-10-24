import { EngineService } from './engine.service';
import { StartWorkflowDto, ProcessNodeDto, CreateHumanTaskDto, ProcessHumanTaskDto } from './dto';
export declare class EngineController {
    private readonly engineService;
    constructor(engineService: EngineService);
    startWorkflow(workflowId: string, startWorkflowDto: StartWorkflowDto): Promise<{
        runId: string;
        status: string;
    }>;
    processNode(processNodeDto: ProcessNodeDto): Promise<{
        result: any;
    }>;
    createHumanTask(createHumanTaskDto: CreateHumanTaskDto): Promise<{
        message: string;
    }>;
    processHumanTask(taskId: string, processHumanTaskDto: ProcessHumanTaskDto): Promise<{
        message: string;
    }>;
    getEvents(eventType?: string, workspaceId?: string, runId?: string, limit?: number, offset?: number): Promise<{
        events: never[];
        total: number;
    }>;
    getExecutionStatus(runId: string): Promise<{
        runId: string;
        status: string;
    }>;
    getExecutionEvidence(runId: string): Promise<{
        runId: string;
        evidence: {};
    }>;
    retryStep(runId: string, stepId: string): Promise<{
        message: string;
    }>;
    acquireLock(body: {
        lockKey: string;
        lockedBy: string;
        ttlSeconds: number;
    }): Promise<{
        acquired: boolean;
    }>;
    releaseLock(body: {
        lockKey: string;
        lockedBy: string;
    }): Promise<{
        message: string;
    }>;
    getHealth(): Promise<{
        status: string;
        timestamp: string;
    }>;
}
