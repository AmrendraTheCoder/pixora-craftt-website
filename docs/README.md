# Pixora Craftt - Documentation

Welcome to the Pixora Craftt microservices platform documentation. This directory contains all the documentation, examples, and guides for the project.

## Directory Structure

```
docs/
├── README.md              # This file - main documentation index
├── api/                   # API documentation and specifications
├── deployment/            # Deployment guides and testing procedures
│   ├── SETUP_GUIDE.md     # Complete setup and deployment guide
│   └── DEPLOYMENT_TEST.md # Testing procedures and validation
└── examples/              # Configuration templates and examples
    ├── env.template       # Backend environment variables template
    └── env.frontend.template # Frontend environment variables template
```

## Quick Start

1. **Setup Environment**
   ```bash
   # Copy environment templates
   cp docs/examples/env.template .env
   cp docs/examples/env.frontend.template frontend/.env.local
   ```

2. **Install Dependencies**
   ```bash
   # Install all workspace dependencies
   npm run setup
   ```

3. **Start Development**
   ```bash
   # Start all services
   npm start
   
   # Or start just frontend
   npm run dev
   ```

## Documentation Sections

### [Deployment Guide](./deployment/SETUP_GUIDE.md)
Complete setup instructions for the microservices platform including:
- Environment configuration
- Docker setup
- Database initialization
- Service deployment

### [Testing Procedures](./deployment/DEPLOYMENT_TEST.md)
Comprehensive testing guide for validating the deployment:
- Service health checks
- API endpoint testing
- Frontend functionality validation
- Integration testing

### [Configuration Examples](./examples/)
Template files and configuration examples:
- Environment variables for all services
- Docker configuration
- Database setup scripts

## Architecture Overview

### Backend Services
- **API Gateway** (Port 4000) - Main entry point and request routing
- **Auth Service** (Port 4001) - User authentication and session management
- **CMS Service** (Port 4002) - Content management for services, projects, testimonials
- **Admin Service** (Port 4003) - Analytics, contact forms, system monitoring

### Frontend
- **React Application** - Modern UI built with React, TypeScript, and Tailwind CSS
- **Component Library** - Radix UI components with custom styling
- **State Management** - Context-based state with API integration

### Infrastructure
- **PostgreSQL** - Primary database for all services
- **Redis** - Caching and session storage
- **Nginx** - Reverse proxy and load balancer
- **Prometheus** - Metrics collection
- **Grafana** - Monitoring dashboards

## Development Workflow

1. **Backend Development**: Services are in `backend/` directory with individual packages
2. **Frontend Development**: React application in `frontend/` directory
3. **Infrastructure**: Docker and monitoring configurations in `infrastructure/`
4. **Documentation**: All docs and examples in this `docs/` directory

## Support

For issues or questions:
1. Check the deployment guide first
2. Review the testing procedures
3. Check service logs: `npm run logs`
4. Restart services: `npm run restart`

## Contributing

When adding new features:
1. Update relevant documentation
2. Add configuration examples if needed
3. Update testing procedures
4. Follow the established architecture patterns 