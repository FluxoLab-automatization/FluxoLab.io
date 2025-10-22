import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  it('records histogram buckets and exposes Prometheus output', () => {
    const metrics = new MetricsService();

    metrics.recordHistogram('http_request_duration_seconds', 0.4, { method: 'GET', path: '/api' });
    metrics.recordHistogram('http_request_duration_seconds', 2.1, { method: 'GET', path: '/api' });
    metrics.recordHistogram('http_request_duration_seconds', 8.5, { method: 'GET', path: '/api' });

    const prom = metrics.getPrometheusMetrics();

    expect(prom).toContain('http_request_duration_seconds_count{method="GET",path="/api"} 3');
    expect(prom).toContain('http_request_duration_seconds_bucket{le="1"}{method="GET",path="/api"} 1');
    expect(prom).toContain(
      'http_request_duration_seconds_bucket{le="10"}{method="GET",path="/api"} 3',
    );
    expect(prom).toContain('http_request_duration_seconds_bucket{le="+Inf"}{method="GET",path="/api"} 3');
  });
});
