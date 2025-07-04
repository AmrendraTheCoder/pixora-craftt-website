# Monitoring Setup

This directory contains the complete monitoring stack for the Pixora Craftt microservices platform using Prometheus and Grafana.

## Components

### Prometheus
- **URL**: http://localhost:9090
- **Purpose**: Metrics collection and alerting
- **Configuration**: `prometheus.yml`
- **Alert Rules**: `alert_rules.yml`

### Grafana
- **URL**: http://localhost:3000
- **Purpose**: Metrics visualization and dashboards
- **Default Login**: admin/admin
- **Dashboards**: Pre-configured with microservices and business metrics

### Exporters
- **Node Exporter**: System metrics (CPU, memory, disk)
- **PostgreSQL Exporter**: Database metrics
- **Redis Exporter**: Cache metrics
- **Nginx Exporter**: Web server metrics
- **cAdvisor**: Container metrics

## Quick Start

### Using Docker Compose

The monitoring stack is included in the main docker-compose.yml:

```bash
# Start the complete stack including monitoring
docker-compose up -d

# Access Grafana
open http://localhost:3000

# Access Prometheus
open http://localhost:9090
```

### Manual Setup

1. **Start Prometheus:**
   ```bash
   docker run -d \
     --name prometheus \
     -p 9090:9090 \
     -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
     -v $(pwd)/alert_rules.yml:/etc/prometheus/alert_rules.yml \
     prom/prometheus
   ```

2. **Start Grafana:**
   ```bash
   docker run -d \
     --name grafana \
     -p 3000:3000 \
     -v $(pwd)/grafana:/etc/grafana/provisioning \
     grafana/grafana
   ```

## Dashboards

### 1. Microservices Overview
- Service health status
- Response times and error rates
- Resource utilization (CPU, memory)
- Database and Redis metrics

### 2. Business Metrics
- Page views and conversion rates
- Contact form submissions
- User authentication metrics
- Popular content analysis

## Alerts

### Critical Alerts
- Service down
- Database unavailable
- High error rates (>10%)
- System resource exhaustion

### Warning Alerts
- High response times (>1s)
- High resource usage (>90%)
- Authentication failures
- Low conversion rates

### Business Alerts
- Conversion rate drops
- High bounce rates
- Unusual traffic patterns

## Metrics Collection

### Application Metrics
Each microservice exposes metrics at `/metrics`:

```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200",service="api-gateway"} 1234

# HELP http_request_duration_seconds HTTP request duration
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.1",service="auth-service"} 95
```

### Business Metrics
Custom metrics for business KPIs:

```
# HELP contact_form_submissions_total Total contact form submissions
# TYPE contact_form_submissions_total counter
contact_form_submissions_total{service_type="web"} 45

# HELP analytics_events_total Total analytics events
# TYPE analytics_events_total counter
analytics_events_total{type="page_view",page="/"} 1234
```

## Configuration

### Environment Variables
```bash
# Prometheus
PROMETHEUS_RETENTION_TIME=15d
PROMETHEUS_SCRAPE_INTERVAL=15s

# Grafana
GF_SECURITY_ADMIN_PASSWORD=admin123
GF_INSTALL_PLUGINS=grafana-piechart-panel

# Exporters
POSTGRES_EXPORTER_DATA_SOURCE_NAME=postgresql://user:pass@postgres:5432/db
REDIS_EXPORTER_REDIS_ADDR=redis:6379
```

### Custom Metrics

Add custom metrics to your services:

```javascript
// Example: Express.js with prom-client
const client = require('prom-client');

// Create metrics
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'status', 'service']
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['service', 'endpoint']
});

// Use in middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    httpRequestsTotal.inc({
      method: req.method,
      status: res.statusCode,
      service: 'api-gateway'
    });
    httpRequestDuration.observe(
      { service: 'api-gateway', endpoint: req.path },
      (Date.now() - start) / 1000
    );
  });
  next();
});
```

## Troubleshooting

### Common Issues

1. **Metrics not appearing:**
   - Check service `/metrics` endpoints
   - Verify Prometheus targets are up
   - Check firewall/network connectivity

2. **Grafana dashboards empty:**
   - Verify Prometheus datasource
   - Check metric names in queries
   - Ensure time range is appropriate

3. **Alerts not firing:**
   - Check alert rule syntax
   - Verify Prometheus evaluation
   - Check Alertmanager configuration

### Useful Commands

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Check if metrics are available
curl http://localhost:4000/metrics

# Query Prometheus API
curl 'http://localhost:9090/api/v1/query?query=up'

# Check Grafana health
curl http://localhost:3000/api/health
```

## Security Considerations

### Production Setup
- Change default Grafana password
- Enable HTTPS for all endpoints
- Restrict access to monitoring ports
- Use authentication for Prometheus
- Secure metrics endpoints

### Network Security
```yaml
# Example: Restrict Prometheus access
networks:
  monitoring:
    driver: bridge
    internal: true
```

### Data Retention
- Configure appropriate retention periods
- Set up automated backups
- Monitor storage usage

## Scaling

### High Availability
- Run Prometheus in HA mode
- Use external storage (Thanos/Cortex)
- Set up Grafana clustering
- Implement backup strategies

### Performance Optimization
- Adjust scrape intervals based on needs
- Use recording rules for complex queries
- Optimize dashboard queries
- Set up metric sampling for high-cardinality data

## Integration

### Alerting Integration
- Slack notifications
- PagerDuty integration
- Email alerts
- Webhook endpoints

### External Systems
- Export metrics to external monitoring
- Integration with log aggregation
- Custom alerting rules
- Business intelligence tools 