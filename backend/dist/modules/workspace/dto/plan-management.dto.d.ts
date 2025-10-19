declare const BILLING_INTERVALS: readonly ["month", "year"];
export type BillingInterval = (typeof BILLING_INTERVALS)[number];
export declare class UpgradePlanDto {
    planCode: string;
    billingInterval?: BillingInterval;
    immediate?: boolean;
}
export declare class CancelSubscriptionDto {
    reason?: string;
    immediate?: boolean;
}
export interface AvailablePlan {
    code: string;
    name: string;
    description: string;
    priceAmount: number;
    currency: string;
    billingInterval: BillingInterval;
    features: string[];
    limits: {
        workspaces: number | null;
        users: number | null;
        webhook: number | null;
    };
    popular?: boolean;
}
export interface PlanUpgradeResponse {
    success: boolean;
    newPlan: AvailablePlan;
    billingInfo: {
        nextBillingDate: string;
        proratedAmount: number;
        currency: string;
    };
    message: string;
}
export {};
