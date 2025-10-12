import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';
import { Expose } from 'class-transformer';

const BILLING_INTERVALS = ['month', 'year'] as const;
export type BillingInterval = (typeof BILLING_INTERVALS)[number];

export class UpgradePlanDto {
  @IsString()
  planCode: string;

  @IsOptional()
  @IsIn(BILLING_INTERVALS)
  @Expose({ name: 'billing_interval' }) // aceita snake_case no payload
  billingInterval?: BillingInterval = 'month';

  @IsOptional()
  @IsBoolean()
  immediate?: boolean = true;
}

export class CancelSubscriptionDto {
  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsBoolean()
  immediate?: boolean = false;
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
