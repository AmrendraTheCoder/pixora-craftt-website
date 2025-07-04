# Pixora Craftt Microservices Setup Guide

Welcome to the Pixora Craftt microservices platform! This guide will help you set up and run the entire system in both development and production environments.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │    Frontend     │
│   (Port 80/443) │    │   (Port 3000)   │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┼─────────────────────┐
                                 │                     │
                    ┌─────────────────┐               │
                    │  API Gateway    │               │
                    │   (Port 4000)   │               │
                    └─────────────────┘               │
                             │                        │
           ┌─────────────────┼─────────────────┬──────┴──────┐
           │                 │                 │             │
  ┌────────────────┐ ┌───────────────┐ ┌─────────────┐ ┌─────────────┐
  │ Auth Service   │ │  CMS Service  │ │Admin Service│ │  Monitoring │
  │  (Port 4001)   │ │ (Port 4002)   │ │(Port 4003)  │ │   Stack     │
  └────────────────┘ └───────────────┘ └─────────────┘ └─────────────┘
           │                 │                 │             │
           └─────────────────┼─────────────────┼─────────────┘
                             │                 │
                    ┌────────────────┐ ┌───────────────┐
                    │  PostgreSQL    │ │     Redis     │
                    │  (Port 5432)   │ │  (Port 6379)  │
                    └────────────────┘ └───────────────┘
```

## 🚀 Quick Start (Docker)

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- Git

### 1. Clone and Setup
```bash
git clone <repository-url>
cd pixora-craftt

# Copy environment template
cp env.template .env

# Edit .env file with your configuration
nano .env
```

### 2. Start All Services
```bash
# Start all services in development mode
docker-compose up -d

# Or start with development tools (Adminer, Redis Commander)
docker-compose --profile dev up -d

# View logs
docker-compose logs -f
```

### 3. Verify Installation
```bash
# Check all services are healthy
docker-compose ps

# Test API Gateway
curl http://localhost:4000/health

# Access the application
open http://localhost:3000
```

## 🛠️ Development Setup (Local)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm or yarn

### 1. Environment Setup
```bash
# Install dependencies for all services
npm run setup

# Start databases (if not using Docker)
# PostgreSQL and Redis should be running locally
```

### 2. Database Setup
```bash
# Run database migrations
npm run db:migrate

# Seed with sample data
npm run db:seed
```

### 3. Start Services
```bash
# Start all services in development mode
npm run dev

# Or start services individually
npm run dev:backend    # All backend services
npm run dev:frontend   # Frontend only
npm run dev:api-gateway    # API Gateway only
```

## 📋 Service Details

### 🌐 API Gateway (Port 4000)
- **Purpose**: Request routing, load balancing, rate limiting
- **Health Check**: `http://localhost:4000/health`
- **API Docs**: `http://localhost:4000/docs`
- **Metrics**: `http://localhost:4000/metrics`

### 🔐 Auth Service (Port 4001)
- **Purpose**: User authentication, JWT management, RBAC
- **Features**:
  - User registration/login
  - Password reset
  - JWT token generation/validation
  - Role-based permissions

### 📝 CMS Service (Port 4002)
- **Purpose**: Content management for services, projects, testimonials
- **Features**:
  - CRUD operations for all content
  - Image upload and processing
  - Content versioning
  - SEO metadata management

### 👨‍💼 Admin Service (Port 4003)
- **Purpose**: Analytics, contact management, system monitoring
- **Features**:
  - Contact form submissions
  - User management
  - Analytics dashboard
  - System health monitoring

### 🎨 Frontend (Port 3000)
- **Purpose**: React application with modern UI
- **Features**:
  - Server-side rendering ready
  - Google Analytics integration
  - Progressive Web App features
  - SEO optimized

## 🔧 Configuration

### Environment Variables
Key environment variables to configure:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/pixora_craftt
REDIS_URL=redis://localhost:6379

# JWT Security
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret

# Services
API_GATEWAY_PORT=4000
AUTH_SERVICE_PORT=4001
CMS_SERVICE_PORT=4002
ADMIN_SERVICE_PORT=4003

# External Services
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
SENTRY_DSN=https://your-sentry-dsn

# Email (for auth notifications)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Storage
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_BUCKET_NAME=pixora-craftt-assets
```

## 🐳 Docker Commands

### Development
```bash
# Start all services
docker-compose up -d

# Start with development tools
docker-compose --profile dev up -d

# View logs
docker-compose logs -f [service-name]

# Restart a service
docker-compose restart [service-name]

# Stop all services
docker-compose down
```

### Production
```bash
# Build for production
docker-compose -f docker-compose.prod.yml build

# Start production stack
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale api-gateway=3
```

## 📊 Monitoring & Debugging

### Available Dashboards
- **Grafana**: `http://localhost:3001` (admin/grafana_admin_password)
- **Prometheus**: `http://localhost:9090`
- **Adminer**: `http://localhost:8080` (dev profile)
- **Redis Commander**: `http://localhost:8081` (dev profile)

### Health Checks
```bash
# Overall system health
curl http://localhost:4000/health

# Individual service health
curl http://localhost:4001/health  # Auth Service
curl http://localhost:4002/health  # CMS Service
curl http://localhost:4003/health  # Admin Service
```

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api-gateway
docker-compose logs -f frontend

# View last 100 lines
docker-compose logs --tail=100 api-gateway
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Test specific service
cd backend/auth-service && npm test
cd backend/cms-service && npm test
cd frontend && npm test

# E2E tests
npm run test:e2e
```

### Manual Testing
```bash
# Test API endpoints
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test CMS endpoints
curl http://localhost:4000/api/cms/services

# Test admin endpoints
curl http://localhost:4000/api/admin/contacts
```

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**
   - [ ] Update all passwords and secrets
   - [ ] Configure production database URLs
   - [ ] Set up SSL certificates
   - [ ] Configure external services (AWS, email, etc.)

2. **Database**
   - [ ] Run production migrations
   - [ ] Set up database backups
   - [ ] Configure connection pooling

3. **Security**
   - [ ] Enable HTTPS
   - [ ] Configure firewall rules
   - [ ] Set up monitoring and alerting
   - [ ] Enable log aggregation

4. **Performance**
   - [ ] Configure CDN for static assets
   - [ ] Set up Redis cluster
   - [ ] Configure load balancer
   - [ ] Enable compression

### Deployment Commands
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Run database migrations
docker-compose -f docker-compose.prod.yml exec api-gateway npm run db:migrate
```

## 🔒 Security

### Best Practices Implemented
- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control
- **Input Validation**: Request validation with Joi
- **Rate Limiting**: Per-IP request limiting
- **CORS**: Configurable cross-origin policies
- **Security Headers**: Comprehensive security headers
- **SQL Injection Prevention**: TypeORM protection
- **XSS Protection**: Content Security Policy

### Security Configuration
```bash
# Generate secure JWT secrets
openssl rand -base64 32

# Create SSL certificates
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout infrastructure/ssl/private.key \
  -out infrastructure/ssl/cert.pem
```

## 📚 API Documentation

### Swagger Documentation
- **URL**: `http://localhost:4000/docs`
- **OpenAPI Spec**: `http://localhost:4000/api-docs.json`

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

#### CMS
- `GET /api/cms/services` - Get all services
- `POST /api/cms/services` - Create service
- `PUT /api/cms/services/:id` - Update service
- `DELETE /api/cms/services/:id` - Delete service

#### Admin
- `GET /api/admin/contacts` - Get contacts
- `GET /api/admin/analytics` - Get analytics
- `GET /api/admin/users` - Get users

## 🤝 Support & Troubleshooting

### Common Issues

1. **Services won't start**
   ```bash
   # Check if ports are in use
   lsof -i :4000,:4001,:4002,:4003
   
   # Check Docker status
   docker-compose ps
   ```

2. **Database connection issues**
   ```bash
   # Check PostgreSQL connection
   docker-compose exec postgres psql -U pixora_user -d pixora_craftt
   
   # Check Redis connection
   docker-compose exec redis redis-cli ping
   ```

3. **Frontend build issues**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Remove node_modules and reinstall
   rm -rf node_modules && npm install
   ```

### Getting Help
- **Documentation**: Check the `/docs` folder for detailed documentation
- **Issues**: Create an issue on GitHub
- **Email**: support@pixoracraftt.com

## 🎯 Next Steps

1. **Customize the Frontend**: Update branding, colors, and content
2. **Configure External Services**: Set up AWS, email, analytics
3. **Add Your Content**: Use the CMS to add your services and projects
4. **Set Up Production**: Deploy to your hosting platform
5. **Monitor & Scale**: Set up monitoring and scale as needed

---

**Happy coding! 🚀**

The Pixora Craftt Team 