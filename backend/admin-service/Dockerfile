# Multi-stage build for Admin Service
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/admin-service/package*.json ./backend/admin-service/
COPY backend/shared/package*.json ./backend/shared/

# Install dependencies
RUN npm ci --only=production

# Builder stage
FROM base AS builder
WORKDIR /app

# Copy package files and install all dependencies (including dev)
COPY package*.json ./
COPY backend/admin-service/package*.json ./backend/admin-service/
COPY backend/shared/ ./backend/shared/
RUN npm ci

# Copy source code
COPY backend/admin-service/src ./backend/admin-service/src
COPY backend/admin-service/tsconfig.json ./backend/admin-service/

# Build the application
WORKDIR /app/backend/admin-service
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 adminservice

# Copy built application
COPY --from=builder --chown=adminservice:nodejs /app/backend/admin-service/dist ./dist
COPY --from=builder --chown=adminservice:nodejs /app/backend/shared ./shared
COPY --from=deps --chown=adminservice:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=adminservice:nodejs /app/backend/admin-service/package*.json ./

# Switch to non-root user
USER adminservice

# Expose port
EXPOSE 4003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4003/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the application
CMD ["node", "dist/index.js"] 