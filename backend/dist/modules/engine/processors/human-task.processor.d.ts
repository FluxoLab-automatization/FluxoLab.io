import { Job } from 'bull';
export declare class HumanTaskProcessor {
    private readonly logger;
    handleHumanTaskCreation(job: Job<{
        runId: string;
        stepId: string;
        taskType: string;
        title: string;
        description?: string;
        instructions?: string;
        priority?: string;
        assignedTo?: string;
        slaHours?: number;
        inputData?: any;
    }>): Promise<void>;
    handleHumanTaskProcessing(job: Job<{
        taskId: string;
        action: string;
        performedBy: string;
        comment?: string;
        outputData?: any;
    }>): Promise<void>;
    handleHumanTaskEscalation(job: Job<{
        taskId: string;
        escalationLevel: number;
        escalatedTo: string;
        reason: string;
    }>): Promise<void>;
    handleNotificationSending(job: Job<{
        taskId: string;
        notificationType: string;
        recipientId: string;
        channel: string;
        subject?: string;
        body: string;
    }>): Promise<void>;
}
