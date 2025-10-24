import { Job } from 'bull';
export declare class EvidenceProcessor {
    private readonly logger;
    handleEvidencePackageGeneration(job: Job<{
        runId: string;
        packageType: string;
        manifest: any;
    }>): Promise<void>;
    handleEvidencePackageSigning(job: Job<{
        packageId: string;
        signerId: string;
        signerName: string;
        signatureAlgorithm: string;
    }>): Promise<void>;
    handleEvidencePackageValidation(job: Job<{
        packageId: string;
        validationType: string;
    }>): Promise<void>;
    handleEvidencePackageExport(job: Job<{
        packageId: string;
        exportFormat: string;
        recipientId: string;
    }>): Promise<void>;
    handleDataMasking(job: Job<{
        data: any;
        maskingRules: any[];
        context: any;
    }>): Promise<void>;
    handleDataCleanup(job: Job<{
        retentionPolicyId: string;
        dataType: string;
    }>): Promise<void>;
}
