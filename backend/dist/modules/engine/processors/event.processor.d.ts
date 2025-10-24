import { Job } from 'bull';
export declare class EventProcessor {
    private readonly logger;
    handleEventProcessing(job: Job<{
        eventId: string;
        eventType: string;
        payload: any;
    }>): Promise<void>;
    private handleWebhookReceived;
    private handleRunStarted;
    private handleRunRunning;
    private handleRunSucceeded;
    private handleRunFailed;
    private handleStepStarted;
    private handleStepSucceeded;
    private handleStepFailed;
    private handleHumanTaskCreated;
    private handleHumanTaskResolved;
    private handleEvidencePackaged;
    private handleUsageIncremented;
    private handleAlertRaised;
}
