# API Documentation

This directory contains the API documentation for all Pixora Craftt microservices.

## Services

### API Gateway (Port 4000)
**Base URL**: `http://localhost:4000`

Main entry point for all API requests. Handles routing, authentication, rate limiting, and load balancing.

#### Health Check
- **GET** `/health` - Service health status
- **GET** `/metrics` - Prometheus metrics

#### Service Routes
- **Prefix** `/auth` → Auth Service (Port 4001)
- **Prefix** `/cms` → CMS Service (Port 4002)  
- **Prefix** `/admin` → Admin Service (Port 4003)

### Auth Service (Port 4001)
**Base URL**: `http://localhost:4000/auth`

Handles user authentication, registration, sessions, and account management.

#### Authentication Endpoints
- **POST** `/register` - User registration
- **POST** `/login` - User login
- **POST** `/logout` - User logout
- **POST** `/refresh-token` - Refresh JWT token

#### Account Management
- **GET** `/profile` - Get user profile
- **PUT** `/profile` - Update user profile
- **POST** `/forgot-password` - Request password reset
- **POST** `/reset-password` - Reset password with token
- **POST** `/verify-email` - Verify email address

#### Two-Factor Authentication
- **POST** `/2fa/setup` - Setup 2FA
- **POST** `/2fa/verify` - Verify 2FA token
- **POST** `/2fa/disable` - Disable 2FA

### CMS Service (Port 4002)
**Base URL**: `http://localhost:4000/cms`

Content management for services, projects, testimonials, and media.

#### Public Endpoints
- **GET** `/services` - Get all active services
- **GET** `/projects` - Get all active projects
- **GET** `/testimonials` - Get all active testimonials
- **GET** `/media/:id` - Get media file

#### Admin Endpoints (Authentication Required)
- **POST** `/services` - Create service
- **PUT** `/services/:id` - Update service
- **DELETE** `/services/:id` - Delete service
- **POST** `/projects` - Create project
- **PUT** `/projects/:id` - Update project
- **DELETE** `/projects/:id` - Delete project
- **POST** `/testimonials` - Create testimonial
- **PUT** `/testimonials/:id` - Update testimonial
- **DELETE** `/testimonials/:id` - Delete testimonial
- **POST** `/media/upload` - Upload media file

### Admin Service (Port 4003)
**Base URL**: `http://localhost:4000/admin`

Analytics, contact management, and system monitoring.

#### Analytics
- **GET** `/analytics/overview` - Get analytics overview
- **GET** `/analytics/metrics` - Get detailed metrics
- **POST** `/analytics/event` - Track analytics event

#### Contact Management
- **POST** `/contact` - Submit contact form
- **GET** `/contacts` - Get all contacts (admin only)
- **PUT** `/contacts/:id/status` - Update contact status

#### System Monitoring
- **GET** `/system/health` - System health check
- **GET** `/system/logs` - Get system logs
- **GET** `/system/metrics` - Get system metrics

## Request/Response Format

### Standard Response Format
```json
{
  "success": true,
  "data": {}, // Response data
  "message": "Success message",
  "metadata": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "uuid"
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  },
  "metadata": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "uuid"
  }
}
```

## Authentication

### JWT Token Format
All authenticated requests require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Token Structure
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "user|admin|super_admin",
  "iat": 1640995200,
  "exp": 1640998800
}
```

## Rate Limiting

- **General**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 5 requests per 15 minutes per IP
- **Admin endpoints**: 50 requests per 15 minutes per authenticated user

## Status Codes

- **200** - Success
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **403** - Forbidden
- **404** - Not Found
- **429** - Too Many Requests
- **500** - Internal Server Error

## Example Requests

### User Registration
```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Get Services
```bash
curl -X GET http://localhost:4000/cms/services
```

### Submit Contact Form
```bash
curl -X POST http://localhost:4000/admin/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello, I need help with my project"
  }'
``` 