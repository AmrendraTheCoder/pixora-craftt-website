# API Gateway Dockerfile
FROM node:20-alpine AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including dev dependencies
RUN npm install && npm cache clean --force

# Development stage
FROM base AS development
COPY . .
EXPOSE 4000
CMD ["npm", "run", "dev"]

# Production stage - for now just use development
FROM base AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S apigateway -u 1001

# Copy application
COPY --chown=apigateway:nodejs . .

# Switch to non-root user
USER apigateway

EXPOSE 4000
CMD ["node", "src/index.js"] 