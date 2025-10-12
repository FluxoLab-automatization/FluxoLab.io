import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export enum UsagePeriod {
  DAY = '1d',
  WEEK = '7d',
  MONTH = '30d',
  QUARTER = '90d',
  YEAR = '365d',
}

export class UsageHistoryQueryDto {
  @IsOptional()
  @IsEnum(UsagePeriod)
  @Transform(({ value }) => value || UsagePeriod.MONTH)
  period?: UsagePeriod = UsagePeriod.MONTH;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  metric?: 'webhooks' | 'users' | 'workflows' | 'all';
}

export interface UsageDataPoint {
  date: string;
  value: number;
  label: string;
}

export interface UsageHistoryResponse {
  metric: string;
  period: string;
  data: UsageDataPoint[];
  summary: {
    total: number;
    average: number;
    peak: number;
    growth: number; // percentage compared to previous period
  };
}
