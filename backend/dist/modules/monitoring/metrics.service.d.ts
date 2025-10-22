export interface MetricPoint {
    timestamp: string;
    value: number;
    labels?: Record<string, string>;
}
export interface CounterMetric {
    name: string;
    description: string;
    value: number;
    labels: Record<string, string>;
}
export interface HistogramMetric {
    name: string;
    description: string;
    buckets: number[];
    bucketCounts: number[];
    count: number;
    sum: number;
    labels: Record<string, string>;
}
export declare class MetricsService {
    private counters;
    private histograms;
    private gauges;
    incrementCounter(name: string, labels?: Record<string, string>, value?: number): void;
    recordHistogram(name: string, value: number, labels?: Record<string, string>): void;
    setGauge(name: string, value: number): void;
    getGauge(name: string): number | undefined;
    getAllMetrics(): {
        counters: CounterMetric[];
        histograms: HistogramMetric[];
        gauges: Record<string, number>;
    };
    getPrometheusMetrics(): string;
    reset(): void;
    private getMetricKey;
    private formatLabels;
    recordRequest(method: string, path: string, statusCode: number, duration: number): void;
    recordWebhookEvent(eventType: string, status: string, duration: number): void;
    recordDatabaseQuery(queryType: string, duration: number): void;
    recordError(errorType: string, service: string): void;
}
