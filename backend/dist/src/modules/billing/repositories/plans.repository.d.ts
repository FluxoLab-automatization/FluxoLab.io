import { DatabaseService } from '../../../shared/database/database.service';
export interface WorkspacePlan {
    id: string;
    code: string;
    name: string;
    description: string | null;
    priceAmount: number;
    currency: string;
    billingInterval: 'month' | 'year';
    trialDays: number;
    isActive: boolean;
    metadata: Record<string, unknown>;
    features: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}
export declare class PlansRepository {
    private readonly database;
    constructor(database: DatabaseService);
    private get pool();
    private normalizePlan;
    findActivePlans(): Promise<WorkspacePlan[]>;
    findByCode(code: string): Promise<WorkspacePlan | null>;
    findById(id: string): Promise<WorkspacePlan | null>;
}
