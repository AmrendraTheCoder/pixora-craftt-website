# API Gateway Dockerfile
FROM node:18-alpine

LABEL maintainer="Pixora Craftt Team"
LABEL description="API Gateway service for Pixora Craftt microservices"

# Create app directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    curl \
    bash \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy shared dependencies
COPY ../shared /app/shared
RUN cd /app/shared && npm install && npm run build

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S apigateway -u 1001

# Create logs directory
RUN mkdir -p /app/logs && chown -R apigateway:nodejs /app/logs

# Switch to non-root user
USER apigateway

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${API_GATEWAY_PORT:-4000}/health || exit 1

# Expose port
EXPOSE ${API_GATEWAY_PORT:-4000}

# Start the application
CMD ["npm", "start"] 