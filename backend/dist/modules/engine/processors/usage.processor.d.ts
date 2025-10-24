import { Job } from 'bull';
export declare class UsageProcessor {
    private readonly logger;
    handleUsageIncrement(job: Job<{
        workspaceId: string;
        counterType: string;
        resourceId?: string;
        resourceName?: string;
        incrementValue: number;
    }>): Promise<void>;
    handleQuotaLimitCheck(job: Job<{
        workspaceId: string;
        quotaType: string;
    }>): Promise<void>;
    handleUsageReportGeneration(job: Job<{
        workspaceId: string;
        reportType: string;
        periodStart: Date;
        periodEnd: Date;
        generatedBy: string;
    }>): Promise<void>;
    handleInvoiceGeneration(job: Job<{
        workspaceId: string;
        subscriptionId: string;
        periodStart: Date;
        periodEnd: Date;
    }>): Promise<void>;
    handlePaymentProcessing(job: Job<{
        invoiceId: string;
        paymentMethod: string;
        amount: number;
        currency: string;
        externalPaymentId?: string;
    }>): Promise<void>;
    handleQuotaCounterReset(job: Job<{
        workspaceId: string;
        resetPeriod: string;
    }>): Promise<void>;
}
