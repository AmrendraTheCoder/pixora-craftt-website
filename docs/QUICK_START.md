# Quick Start Guide

Get Pixora Craftt running in 5 minutes!

## Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

## 🚀 Setup & Run

### 1. Clone & Setup
```bash
git clone <repository-url>
cd pixora-craftt

# Setup environment files
npm run setup
```

### 2. Start Everything
```bash
# Start all services with Docker
npm start

# OR start frontend only for development
npm run dev
```

### 3. Access Applications
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:4000
- **Admin Panel**: http://localhost:4000/admin
- **API Docs**: http://localhost:4000/docs

## 🔧 Development Workflow

### Frontend Development
```bash
cd frontend
npm run dev     # Start dev server
npm run build   # Build for production
npm run lint    # Lint code
```

### Backend Development
```bash
# All services managed via Docker
npm start       # Start all services
npm stop        # Stop all services
npm restart     # Restart all services
npm run logs    # View logs
```

### Database Operations
```bash
# Database is automatically initialized via Docker
# Check database connection
npm run health
```

## 📁 Key Files

- `package.json` - Root workspace configuration
- `docker-compose.yml` - All services orchestration
- `frontend/package.json` - Frontend dependencies
- `docs/examples/env.template` - Backend environment variables
- `docs/examples/env.frontend.template` - Frontend environment variables

## 🛠️ Common Commands

```bash
# Project Management
npm run setup    # Install all dependencies + setup env files
npm start        # Start all services
npm stop         # Stop all services
npm run logs     # View all service logs
npm run health   # Check service health

# Development
npm run dev      # Start frontend dev server
npm run build    # Build all projects
npm run lint     # Lint all projects
npm test         # Run all tests

# Cleanup
npm run clean    # Stop services and remove containers
```

## 🐛 Troubleshooting

### Services won't start?
```bash
# Check Docker is running
docker --version

# Clean and restart
npm run clean
npm start
```

### Frontend not loading?
```bash
# Check if frontend is running
curl http://localhost:3000

# Restart frontend only
cd frontend && npm run dev
```

### API not responding?
```bash
# Check API Gateway health
curl http://localhost:4000/health

# View service logs
npm run logs
```

### Database connection issues?
```bash
# Check database container
docker ps | grep postgres

# View database logs
docker logs pixora-craftt-db
```

## 📝 Next Steps

1. **Configure Environment**: Copy and edit environment files in `docs/examples/`
2. **Read Documentation**: Check `docs/` folder for detailed guides
3. **API Reference**: Visit `docs/api/README.md` for API documentation
4. **Deployment**: Follow `docs/deployment/SETUP_GUIDE.md` for production deployment

## 🆘 Need Help?

- Check `docs/deployment/DEPLOYMENT_TEST.md` for testing procedures
- Review `docs/api/README.md` for API documentation
- Examine service logs: `npm run logs`
- Verify service health: `npm run health` 