# Pixora Craftt - Microservices Platform

A modern, scalable digital agency platform built with microservices architecture, featuring Node.js backend services and React frontend.

## 🏗️ Project Structure

```
pixora-craftt/
├── frontend/               # React Frontend Application
├── backend/               # Backend Microservices
│   ├── api-gateway/       # API Gateway (Port 4000)
│   ├── auth-service/      # Authentication Service (Port 4001)
│   ├── cms-service/       # Content Management (Port 4002)
│   ├── admin-service/     # Admin Dashboard (Port 4003)
│   └── shared/           # Shared utilities and types
├── infrastructure/        # Docker, Nginx, Monitoring
├── docs/                 # Documentation & Examples
│   ├── api/              # API Documentation
│   ├── deployment/       # Setup & Deployment Guides
│   └── examples/         # Configuration Templates
├── docker-compose.yml    # Docker orchestration
└── package.json         # Monorepo workspace config
```

## 🏗️ Architecture Overview

This project follows a microservices architecture with clear separation of concerns:

## 🚀 Technology Stack

### Backend Services

- **Node.js** with TypeScript
- **Express.js** for API development
- **PostgreSQL** with TypeORM
- **Redis** for caching and sessions
- **JWT** for authentication
- **Docker** for containerization
- **Nginx** for reverse proxy and load balancing

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Query** for API state management
- **Google Analytics 4** for tracking
- **Sentry** for error monitoring

### Infrastructure

- **Docker Compose** for local development
- **Nginx** for reverse proxy
- **PM2** for process management
- **Winston** for logging
- **Prometheus** + **Grafana** for monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose

### Get Started in 3 Steps

1. **Setup**
   ```bash
   git clone <repository>
   cd pixora-craftt
   npm run setup
   ```

2. **Start**
   ```bash
   npm start
   ```

3. **Access**
   - Frontend: http://localhost:3000
   - API: http://localhost:4000
   - Docs: [docs/QUICK_START.md](docs/QUICK_START.md)

> 📖 **Detailed Guide**: See [docs/QUICK_START.md](docs/QUICK_START.md) for complete setup instructions.

## 📋 Services Overview

### 🔐 Auth Service (Port 4001)

- User authentication and authorization
- JWT token management
- Password reset and email verification
- Role-based access control (RBAC)

### 📝 CMS Service (Port 4002)

- Content management for services, projects, testimonials
- Image upload and processing
- Content versioning and publishing
- SEO metadata management

### 👨‍💼 Admin Service (Port 4003)

- Analytics dashboard
- Contact form submissions
- User management
- System monitoring and health checks

### 🌐 API Gateway (Port 4000)

- Request routing and load balancing
- Rate limiting and authentication middleware
- API documentation with Swagger
- CORS and security headers

### 🎨 Frontend (Port 3000)

- Modern React application
- Server-side rendering (SSR) ready
- Google Analytics integration
- Progressive Web App (PWA) features
- SEO optimized

## 🔧 Environment Configuration

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/pixora_craftt
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=24h

# Services
API_GATEWAY_PORT=4000
AUTH_SERVICE_PORT=4001
CMS_SERVICE_PORT=4002
ADMIN_SERVICE_PORT=4003
FRONTEND_PORT=3000

# External Services
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
SENTRY_DSN=https://your-sentry-dsn
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Storage
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_BUCKET_NAME=pixora-craftt-assets
```

## 🐳 Docker Deployment

### Development

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Monitoring & Logging

- **Health Checks**: `/health` endpoint on all services
- **Metrics**: Prometheus metrics at `/metrics`
- **Logs**: Centralized logging with Winston
- **Monitoring**: Grafana dashboards for system metrics
- **Error Tracking**: Sentry integration for error monitoring

## 🔒 Security Features

- **Authentication**: JWT-based auth with refresh tokens
- **Authorization**: Role-based access control
- **Rate Limiting**: API rate limiting per IP/user
- **CORS**: Configurable CORS policies
- **Input Validation**: Request validation with Joi/Zod
- **SQL Injection Prevention**: TypeORM query protection
- **XSS Protection**: Content Security Policy headers

## 📚 API Documentation

API documentation is available at:

- Swagger UI: http://localhost:4000/docs
- OpenAPI Spec: http://localhost:4000/api-docs.json

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests for specific service
cd backend/auth-service && npm test
cd backend/cms-service && npm test
cd frontend && npm test

# E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Production Deployment Checklist

1. **Environment Setup**:

   - Configure production environment variables
   - Setup SSL certificates
   - Configure domain and DNS

2. **Database**:

   - Setup PostgreSQL cluster
   - Run database migrations
   - Configure backups

3. **Services**:

   - Build and push Docker images
   - Deploy with Docker Swarm/Kubernetes
   - Configure Nginx load balancer

4. **Monitoring**:
   - Setup log aggregation
   - Configure alerting
   - Deploy monitoring stack

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Support

For support and questions:

- Create an issue on GitHub
- Contact: support@pixoracraftt.com
- Documentation: [docs.pixoracraftt.com](docs.pixoracraftt.com)
