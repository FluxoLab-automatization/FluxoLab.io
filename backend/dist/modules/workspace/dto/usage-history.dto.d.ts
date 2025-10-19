export declare enum UsagePeriod {
    DAY = "1d",
    WEEK = "7d",
    MONTH = "30d",
    QUARTER = "90d",
    YEAR = "365d"
}
export declare class UsageHistoryQueryDto {
    period?: UsagePeriod;
    startDate?: string;
    endDate?: string;
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
        growth: number;
    };
}
