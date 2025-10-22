import { Injectable } from '@nestjs/common';

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

@Injectable()
export class MetricsService {
  private counters = new Map<string, CounterMetric>();
  private histograms = new Map<string, HistogramMetric>();
  private gauges = new Map<string, number>();

  // Counter methods
  incrementCounter(name: string, labels: Record<string, string> = {}, value: number = 1): void {
    const key = this.getMetricKey(name, labels);
    const existing = this.counters.get(key);
    
    if (existing) {
      existing.value += value;
    } else {
      this.counters.set(key, {
        name,
        description: `Counter metric for ${name}`,
        value,
        labels,
      });
    }
  }

  // Histogram methods
  recordHistogram(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = this.getMetricKey(name, labels);
    const existing = this.histograms.get(key);

    const buckets = [0.1, 0.5, 1, 2.5, 5, 10, 30, 60, 120, 300]; // seconds

    if (existing) {
      existing.count += 1;
      existing.sum += value;
      existing.bucketCounts = existing.bucketCounts.map((count, index) =>
        value <= existing.buckets[index] ? count + 1 : count,
      );
    } else {
      const bucketCounts = buckets.map((boundary) => (value <= boundary ? 1 : 0));
      this.histograms.set(key, {
        name,
        description: `Histogram metric for ${name}`,
        buckets,
        bucketCounts,
        count: 1,
        sum: value,
        labels,
      });
    }
  }

  // Gauge methods
  setGauge(name: string, value: number): void {
    this.gauges.set(name, value);
  }

  getGauge(name: string): number | undefined {
    return this.gauges.get(name);
  }

  // Get all metrics
  getAllMetrics(): {
    counters: CounterMetric[];
    histograms: HistogramMetric[];
    gauges: Record<string, number>;
  } {
    return {
      counters: Array.from(this.counters.values()),
      histograms: Array.from(this.histograms.values()),
      gauges: Object.fromEntries(this.gauges),
    };
  }

  // Get metrics in Prometheus format
  getPrometheusMetrics(): string {
    let output = '';
    
    // Counters
    for (const counter of this.counters.values()) {
      const labels = this.formatLabels(counter.labels);
      output += `# HELP ${counter.name} ${counter.description}\n`;
      output += `# TYPE ${counter.name} counter\n`;
      output += `${counter.name}${labels} ${counter.value}\n`;
    }
    
    // Histograms
    for (const histogram of this.histograms.values()) {
      const labels = this.formatLabels(histogram.labels);
      output += `# HELP ${histogram.name} ${histogram.description}\n`;
      output += `# TYPE ${histogram.name} histogram\n`;
      output += `${histogram.name}_count${labels} ${histogram.count}\n`;
      output += `${histogram.name}_sum${labels} ${histogram.sum}\n`;

      histogram.buckets.forEach((bucket, index) => {
        const cumulative = histogram.bucketCounts[index] ?? 0;
        output += `${histogram.name}_bucket{le="${bucket}"}${labels} ${cumulative}\n`;
      });
      output += `${histogram.name}_bucket{le="+Inf"}${labels} ${histogram.count}\n`;
    }
    
    // Gauges
    for (const [name, value] of this.gauges.entries()) {
      output += `# HELP ${name} Gauge metric\n`;
      output += `# TYPE ${name} gauge\n`;
      output += `${name} ${value}\n`;
    }
    
    return output;
  }

  // Reset all metrics
  reset(): void {
    this.counters.clear();
    this.histograms.clear();
    this.gauges.clear();
  }

  private getMetricKey(name: string, labels: Record<string, string>): string {
    const sortedLabels = Object.keys(labels).sort().map(key => `${key}=${labels[key]}`).join(',');
    return `${name}{${sortedLabels}}`;
  }

  private formatLabels(labels: Record<string, string>): string {
    const entries = Object.entries(labels);
    if (entries.length === 0) return '';
    
    const formatted = entries.map(([key, value]) => `${key}="${value}"`).join(',');
    return `{${formatted}}`;
  }

  // Application-specific metrics
  recordRequest(method: string, path: string, statusCode: number, duration: number): void {
    this.incrementCounter('http_requests_total', {
      method,
      path,
      status: statusCode.toString(),
    });
    
    this.recordHistogram('http_request_duration_seconds', duration / 1000, {
      method,
      path,
    });
  }

  recordWebhookEvent(eventType: string, status: string, duration: number): void {
    this.incrementCounter('webhook_events_total', {
      event_type: eventType,
      status,
    });
    
    this.recordHistogram('webhook_processing_duration_seconds', duration / 1000, {
      event_type: eventType,
    });
  }

  recordDatabaseQuery(queryType: string, duration: number): void {
    this.incrementCounter('database_queries_total', {
      query_type: queryType,
    });
    
    this.recordHistogram('database_query_duration_seconds', duration / 1000, {
      query_type: queryType,
    });
  }

  recordError(errorType: string, service: string): void {
    this.incrementCounter('application_errors_total', {
      error_type: errorType,
      service,
    });
  }
}
