"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
let MetricsService = class MetricsService {
    counters = new Map();
    histograms = new Map();
    gauges = new Map();
    incrementCounter(name, labels = {}, value = 1) {
        const key = this.getMetricKey(name, labels);
        const existing = this.counters.get(key);
        if (existing) {
            existing.value += value;
        }
        else {
            this.counters.set(key, {
                name,
                description: `Counter metric for ${name}`,
                value,
                labels,
            });
        }
    }
    recordHistogram(name, value, labels = {}) {
        const key = this.getMetricKey(name, labels);
        const existing = this.histograms.get(key);
        const buckets = [0.1, 0.5, 1, 2.5, 5, 10, 30, 60, 120, 300];
        if (existing) {
            existing.count += 1;
            existing.sum += value;
        }
        else {
            this.histograms.set(key, {
                name,
                description: `Histogram metric for ${name}`,
                buckets,
                count: 1,
                sum: value,
                labels,
            });
        }
    }
    setGauge(name, value) {
        this.gauges.set(name, value);
    }
    getGauge(name) {
        return this.gauges.get(name);
    }
    getAllMetrics() {
        return {
            counters: Array.from(this.counters.values()),
            histograms: Array.from(this.histograms.values()),
            gauges: Object.fromEntries(this.gauges),
        };
    }
    getPrometheusMetrics() {
        let output = '';
        for (const counter of this.counters.values()) {
            const labels = this.formatLabels(counter.labels);
            output += `# HELP ${counter.name} ${counter.description}\n`;
            output += `# TYPE ${counter.name} counter\n`;
            output += `${counter.name}${labels} ${counter.value}\n`;
        }
        for (const histogram of this.histograms.values()) {
            const labels = this.formatLabels(histogram.labels);
            output += `# HELP ${histogram.name} ${histogram.description}\n`;
            output += `# TYPE ${histogram.name} histogram\n`;
            output += `${histogram.name}_count${labels} ${histogram.count}\n`;
            output += `${histogram.name}_sum${labels} ${histogram.sum}\n`;
            for (const bucket of histogram.buckets) {
                output += `${histogram.name}_bucket{le="${bucket}"}${labels} ${this.getBucketCount(histogram.sum, bucket)}\n`;
            }
            output += `${histogram.name}_bucket{le="+Inf"}${labels} ${histogram.count}\n`;
        }
        for (const [name, value] of this.gauges.entries()) {
            output += `# HELP ${name} Gauge metric\n`;
            output += `# TYPE ${name} gauge\n`;
            output += `${name} ${value}\n`;
        }
        return output;
    }
    reset() {
        this.counters.clear();
        this.histograms.clear();
        this.gauges.clear();
    }
    getMetricKey(name, labels) {
        const sortedLabels = Object.keys(labels).sort().map(key => `${key}=${labels[key]}`).join(',');
        return `${name}{${sortedLabels}}`;
    }
    formatLabels(labels) {
        const entries = Object.entries(labels);
        if (entries.length === 0)
            return '';
        const formatted = entries.map(([key, value]) => `${key}="${value}"`).join(',');
        return `{${formatted}}`;
    }
    getBucketCount(sum, bucket) {
        return sum <= bucket ? 1 : 0;
    }
    recordRequest(method, path, statusCode, duration) {
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
    recordWebhookEvent(eventType, status, duration) {
        this.incrementCounter('webhook_events_total', {
            event_type: eventType,
            status,
        });
        this.recordHistogram('webhook_processing_duration_seconds', duration / 1000, {
            event_type: eventType,
        });
    }
    recordDatabaseQuery(queryType, duration) {
        this.incrementCounter('database_queries_total', {
            query_type: queryType,
        });
        this.recordHistogram('database_query_duration_seconds', duration / 1000, {
            query_type: queryType,
        });
    }
    recordError(errorType, service) {
        this.incrementCounter('application_errors_total', {
            error_type: errorType,
            service,
        });
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)()
], MetricsService);
//# sourceMappingURL=metrics.service.js.map