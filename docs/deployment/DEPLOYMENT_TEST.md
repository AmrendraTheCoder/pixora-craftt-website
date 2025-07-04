# Deployment Testing Guide

This guide provides step-by-step instructions to test the complete Pixora Craftt microservices deployment.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for frontend development)
- Git
- At least 4GB RAM available
- Ports 3000, 4000-4003, 5432, 6379, 9090 available

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd pixora-craftt-main

# Copy environment variables
cp env.template .env
cp env.frontend.template .env.local

# Edit environment variables as needed
nano .env
```

### 2. Start Backend Services

```bash
# Build and start all microservices
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Initialize Database

```bash
# Database should auto-initialize, but you can manually run:
docker-compose exec postgres psql -U pixora_user -d pixora_craftt -f /docker-entrypoint-initdb.d/init.sql
docker-compose exec postgres psql -U pixora_user -d pixora_craftt -f /docker-entrypoint-initdb.d/seed.sql
```

### 4. Start Frontend

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or build for production
npm run build
npm run preview
```

## Service Testing

### API Gateway (Port 4000)

```bash
# Health check
curl http://localhost:4000/health

# Test CORS and headers
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:4000/auth/login

# Test rate limiting
for i in {1..20}; do
  curl http://localhost:4000/health
done
```

### Authentication Service (Port 4001)

```bash
# Register user
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pixoracraftt.com",
    "password": "admin123"
  }'

# Test protected route (use token from login)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:4000/auth/me
```

### CMS Service (Port 4002)

```bash
# Get services
curl http://localhost:4000/cms/services

# Get projects
curl http://localhost:4000/cms/projects

# Get testimonials
curl http://localhost:4000/cms/testimonials

# Test admin creation (requires auth token)
curl -X POST http://localhost:4000/cms/services \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Service",
    "description": "Test description",
    "features": ["Feature 1", "Feature 2"],
    "color": "bg-blue-500",
    "isActive": true
  }'
```

### Admin Service (Port 4003)

```bash
# Submit contact form
curl -X POST http://localhost:4000/admin/contact/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Test Inquiry",
    "message": "This is a test message"
  }'

# Track analytics
curl -X POST http://localhost:4000/admin/analytics/track \
  -H "Content-Type: application/json" \
  -d '{
    "type": "page_view",
    "data": {"page": "/", "referrer": "direct"}
  }'

# Get system health (requires admin token)
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     http://localhost:4000/admin/system/health
```

## Frontend Testing

### 1. Page Navigation

Test all routes:
- http://localhost:3000/ (Homepage)
- http://localhost:3000/admin (Admin Dashboard)
- http://localhost:3000/cms (CMS Dashboard)

### 2. Contact Form

1. Navigate to homepage
2. Scroll to contact section
3. Fill out the form:
   - Name: Test User
   - Email: test@example.com
   - Subject: Test Message
   - Message: Testing the contact form
4. Submit and verify success message
5. Check backend logs for form submission

### 3. Quote Calculator

1. Navigate to contact section
2. Switch to "Calculator" tab
3. Select service type, adjust project size
4. Choose timeframe
5. Click "Calculate Estimate"
6. Switch to "Results" tab to see estimate

### 4. CMS Interface

1. Navigate to http://localhost:3000/cms
2. Login with: cms@pixoracraftt.com / admin123
3. Test creating/editing services, projects, testimonials
4. Verify changes appear on homepage

### 5. Admin Dashboard

1. Navigate to http://localhost:3000/admin
2. Login with: admin@pixoracraftt.com / admin123
3. View contact submissions
4. Check analytics overview
5. Monitor system health

## Database Testing

### PostgreSQL

```bash
# Connect to database
docker-compose exec postgres psql -U pixora_user -d pixora_craftt

# Check tables
\dt

# Check sample data
SELECT * FROM users LIMIT 5;
SELECT * FROM services WHERE is_active = true;
SELECT * FROM contacts ORDER BY created_at DESC LIMIT 10;

# Test queries
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_contacts FROM contacts;
SELECT type, COUNT(*) as count FROM analytics GROUP BY type;
```

### Redis

```bash
# Connect to Redis
docker-compose exec redis redis-cli

# Check keys
KEYS *

# Test session storage
SET test_key "test_value"
GET test_key
DEL test_key

# Check stats
INFO memory
INFO stats
```

## Monitoring Testing

### Prometheus (Port 9090)

1. Visit http://localhost:9090
2. Check targets: Status > Targets
3. Test queries:
   - `up` (service availability)
   - `http_requests_total` (request metrics)
   - `process_cpu_seconds_total` (CPU usage)
4. Check alerts: Alerts tab

### Grafana (Port 3000)

1. Visit http://localhost:3000
2. Login: admin / admin
3. Import dashboards from `infrastructure/monitoring/grafana/dashboards/`
4. View microservices overview dashboard
5. View business metrics dashboard

## Load Testing

### Simple Load Test

```bash
# Install Apache Bench
sudo apt-get install apache2-utils  # Ubuntu/Debian
brew install apache2-utils          # macOS

# Test API Gateway
ab -n 1000 -c 10 http://localhost:4000/health

# Test homepage
ab -n 100 -c 5 http://localhost:3000/

# Test contact form
ab -n 50 -c 2 -p contact_data.json -T 'application/json' \
   http://localhost:4000/admin/contact/submit
```

Create `contact_data.json`:
```json
{
  "name": "Load Test",
  "email": "test@example.com",
  "subject": "Load Testing",
  "message": "This is a load test message"
}
```

## Security Testing

### 1. CORS Testing

```bash
# Test CORS headers
curl -H "Origin: http://evil.com" \
     -v http://localhost:4000/health

# Should reject unauthorized origins
curl -H "Origin: http://unauthorized.com" \
     -X POST \
     http://localhost:4000/auth/login
```

### 2. Rate Limiting

```bash
# Test rate limiting (should block after limits)
for i in {1..100}; do
  curl http://localhost:4000/admin/contact/submit \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"name":"spam","email":"spam@test.com","subject":"spam","message":"spam"}'
done
```

### 3. Authentication

```bash
# Test protected routes without token
curl http://localhost:4000/auth/me
# Should return 401

# Test with invalid token
curl -H "Authorization: Bearer invalid_token" \
     http://localhost:4000/auth/me
# Should return 401

# Test SQL injection in login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com'"'"' OR 1=1 --",
    "password": "anything"
  }'
# Should fail safely
```

## Performance Testing

### Database Performance

```sql
-- Test query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'admin@pixoracraftt.com';
EXPLAIN ANALYZE SELECT * FROM contacts WHERE status = 'new' ORDER BY created_at DESC;
EXPLAIN ANALYZE SELECT * FROM analytics WHERE type = 'page_view' AND created_at > NOW() - INTERVAL '1 day';
```

### API Response Times

```bash
# Measure response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:4000/cms/services
```

Create `curl-format.txt`:
```
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
```

## Error Testing

### 1. Service Failures

```bash
# Stop individual services and test failover
docker-compose stop auth-service
curl http://localhost:4000/auth/login  # Should fail gracefully

docker-compose stop cms-service
curl http://localhost:4000/cms/services  # Should fail gracefully

# Restart services
docker-compose start auth-service cms-service
```

### 2. Database Failures

```bash
# Stop database
docker-compose stop postgres

# Test frontend behavior (should fall back to local data)
curl http://localhost:4000/cms/services

# Restart database
docker-compose start postgres
```

### 3. Network Issues

```bash
# Test timeout handling
iptables -A OUTPUT -p tcp --dport 5432 -j DROP  # Block database
curl http://localhost:4000/cms/services
iptables -D OUTPUT -p tcp --dport 5432 -j DROP  # Restore
```

## Cleanup

```bash
# Stop all services
docker-compose down

# Remove volumes (caution: deletes data)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Clean up Docker system
docker system prune -f
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in docker-compose.yml
2. **Memory issues**: Reduce services or increase Docker memory
3. **Permission issues**: Fix file permissions with `chmod`
4. **Network issues**: Check Docker network configuration

### Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs api-gateway
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f auth-service
```

### Health Checks

```bash
# Check all service health
for port in 4000 4001 4002 4003; do
  echo "Checking port $port:"
  curl -s http://localhost:$port/health || echo "FAILED"
done

# Check database
docker-compose exec postgres pg_isready -U pixora_user -d pixora_craftt

# Check Redis
docker-compose exec redis redis-cli ping
```

## Success Criteria

The deployment is successful when:

✅ All services start without errors  
✅ Health checks return 200 OK  
✅ Database contains seed data  
✅ Frontend loads and displays content  
✅ Contact form submissions work  
✅ Authentication flow works  
✅ CMS operations function  
✅ Admin dashboard shows data  
✅ Monitoring dashboards display metrics  
✅ All API endpoints respond correctly  
✅ Rate limiting works  
✅ CORS policies are enforced  
✅ Error handling works gracefully  

## Next Steps

After successful testing:

1. Configure production environment variables
2. Set up SSL/TLS certificates
3. Configure domain names and DNS
4. Set up automated backups
5. Configure log aggregation
6. Set up alerting notifications
7. Implement CI/CD pipeline
8. Perform security audit
9. Set up staging environment
10. Plan production deployment strategy 