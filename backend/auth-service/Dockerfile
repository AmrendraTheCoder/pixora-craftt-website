FROM node:20-alpine AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY ../../package*.json ../../

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 4001
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install dumb-init
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S authuser -u 1001

# Create app directory
WORKDIR /app

# Copy built application
COPY --from=build --chown=authuser:nodejs /app/dist ./dist
COPY --from=build --chown=authuser:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=authuser:nodejs /app/package*.json ./

# Switch to non-root user
USER authuser

# Expose port
EXPOSE 4001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"] 