# 🐳 Installation Guide - Docker & Prerequisites

## Prerequisites for Pixora Craftt Backend

The backend microservices require Docker to run PostgreSQL, Redis, and all services. Here's the complete installation procedure:

## 📋 **Step 1: Install Docker Desktop (macOS)**

### Option A: Download from Docker Website (Recommended)
1. **Go to**: https://www.docker.com/products/docker-desktop/
2. **Click**: "Download for Mac" 
3. **Choose**: 
   - **Apple Silicon (M1/M2/M3)**: Docker Desktop for Mac with Apple Silicon
   - **Intel**: Docker Desktop for Mac with Intel chip
4. **Install**: Open the `.dmg` file and drag Docker to Applications
5. **Launch**: Open Docker Desktop from Applications

### Option B: Install via Homebrew
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Docker Desktop
brew install --cask docker

# Launch Docker Desktop
open /Applications/Docker.app
```

## 📋 **Step 2: Verify Docker Installation**

```bash
# Check Docker version
docker --version

# Check Docker Compose version  
docker-compose --version

# Test Docker is running
docker run hello-world
```

**Expected Output:**
```
Docker version 24.x.x
Docker Compose version v2.x.x
Hello from Docker! (successful test message)
```

## 📋 **Step 3: Start Docker Services**

Make sure Docker Desktop is running (you should see the Docker whale icon in your menu bar), then:

```bash
# Navigate to your project
cd /Users/amrendravikramsingh/Downloads/pixora-craftt-main

# Start all backend services
docker-compose up -d
```

This will start:
- **PostgreSQL** (Database) - Port 5432
- **Redis** (Caching) - Port 6379  
- **API Gateway** - Port 4000
- **Auth Service** - Port 4001
- **CMS Service** - Port 4002
- **Admin Service** - Port 4003
- **Nginx** (Reverse Proxy) - Port 80
- **Grafana** (Monitoring) - Port 3001
- **Prometheus** (Metrics) - Port 9090

## 📋 **Step 4: Verify Backend is Running**

```bash
# Check all containers are running
docker ps

# Check API Gateway health
curl http://localhost:4000/health

# Check specific services
curl http://localhost:4000/cms/services
curl http://localhost:4000/admin/system/health
```

## 📋 **Step 5: Start Frontend**

Once Docker services are running:

```bash
# Start frontend development server
cd frontend
npm run dev
```

**Frontend will be available at:** http://localhost:3000

## 🔧 **Common Issues & Solutions**

### Docker Desktop won't start?
```bash
# Reset Docker Desktop
rm -rf ~/.docker
# Then restart Docker Desktop app
```

### Port conflicts?
```bash
# Check what's using ports
lsof -i :4000
lsof -i :5432
lsof -i :6379

# Stop conflicting services
sudo pkill -f postgres
sudo pkill -f redis
```

### Services not responding?
```bash
# View service logs
docker-compose logs

# Restart specific service
docker-compose restart api-gateway

# Full restart
docker-compose down && docker-compose up -d
```

## 🚀 **Complete Setup Commands**

```bash
# 1. Install Docker Desktop (manual step above)

# 2. Clone and setup project
cd /Users/amrendravikramsingh/Downloads/pixora-craftt-main

# 3. Start backend services
docker-compose up -d

# 4. Wait for services to start (30-60 seconds)
sleep 60

# 5. Verify backend health
curl http://localhost:4000/health

# 6. Start frontend
cd frontend && npm run dev
```

## 📱 **Access Points After Installation**

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:4000
- **Admin API**: http://localhost:4000/admin
- **CMS API**: http://localhost:4000/cms
- **Auth API**: http://localhost:4000/auth
- **Monitoring**: http://localhost:3001 (Grafana)

## 🎯 **Next Steps**

1. **Install Docker Desktop** (Step 1)
2. **Verify installation** (Step 2)  
3. **Start backend** (Step 3)
4. **Verify health** (Step 4)
5. **Start frontend** (Step 5)

Your Pixora Craftt platform will then be fully operational! 🚀 