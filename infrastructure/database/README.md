# Database Setup Guide

This directory contains the database schema and initial data scripts for the Pixora Craftt microservices platform.

## Files

- `init.sql` - Database schema creation script with tables, indexes, and triggers
- `seed.sql` - Initial data insertion script with sample data for development
- `README.md` - This documentation file

## Database Schema

### Auth Service Tables
- `users` - User accounts with authentication information
- `user_sessions` - Active user sessions with refresh tokens
- `password_reset_tokens` - Password reset tokens with expiration

### CMS Service Tables
- `services` - Services offered by the company
- `projects` - Portfolio projects and case studies
- `testimonials` - Client testimonials and reviews
- `media_files` - Uploaded media files and assets

### Admin Service Tables
- `contacts` - Contact form submissions
- `analytics` - Website analytics and tracking data
- `system_logs` - Application logs from all services

## Setup Instructions

### Using Docker Compose (Recommended)

The database is automatically set up when you run the complete microservices stack:

```bash
# Start all services including PostgreSQL
docker-compose up -d

# The database will be automatically initialized with the schema and seed data
```

### Manual Setup

If you're setting up the database manually:

1. **Create the database:**
   ```bash
   createdb pixora_craftt
   ```

2. **Run the initialization script:**
   ```bash
   psql -d pixora_craftt -f infrastructure/database/init.sql
   ```

3. **Insert seed data:**
   ```bash
   psql -d pixora_craftt -f infrastructure/database/seed.sql
   ```

## Environment Variables

Make sure these environment variables are set in your `.env` file:

```bash
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=pixora_craftt
DATABASE_USER=pixora_user
DATABASE_PASSWORD=password
```

## Default Users

The seed data includes these default users for testing:

| Email | Password | Role | Purpose |
|-------|----------|------|---------|
| admin@pixoracraftt.com | admin123 | admin | Full system access |
| cms@pixoracraftt.com | admin123 | cms_manager | Content management |
| demo@pixoracraftt.com | admin123 | user | Regular user |

## Database Features

### Performance Optimizations
- Proper indexing on frequently queried columns
- JSONB columns for flexible data storage
- Optimized foreign key relationships

### Security Features
- Password hashing with bcrypt
- Session management with refresh tokens
- Rate limiting support through IP tracking
- Role-based access control

### Data Integrity
- Foreign key constraints
- Check constraints for enum values
- Automatic timestamp updates via triggers
- UUID primary keys for security

### Analytics & Monitoring
- Comprehensive logging system
- Analytics event tracking
- System health monitoring
- Performance metrics collection

## Backup and Restore

### Create Backup
```bash
pg_dump pixora_craftt > backup.sql
```

### Restore from Backup
```bash
psql -d pixora_craftt < backup.sql
```

## Migrations

For production deployments, consider using a migration tool like:
- Flyway
- Liquibase
- Custom migration scripts

Future schema changes should be handled through versioned migration files rather than modifying the init script directly.

## Monitoring

The database includes built-in monitoring capabilities:
- System logs table for application events
- Analytics table for user behavior tracking
- Performance indexes for query optimization

Monitor these key metrics:
- Connection count
- Query performance
- Storage usage
- Index usage statistics

## Troubleshooting

### Common Issues

1. **Connection refused:**
   - Check if PostgreSQL is running
   - Verify connection settings
   - Ensure firewall allows connections

2. **Permission denied:**
   - Verify user permissions
   - Check database ownership
   - Ensure proper role setup

3. **Schema not found:**
   - Run the init.sql script first
   - Check for syntax errors in SQL files
   - Verify database name is correct

### Useful Commands

```bash
# Check database status
psql -d pixora_craftt -c "SELECT version();"

# List all tables
psql -d pixora_craftt -c "\dt"

# Check table sizes
psql -d pixora_craftt -c "SELECT schemaname,tablename,pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size FROM pg_tables WHERE schemaname='public';"

# View recent logs
psql -d pixora_craftt -c "SELECT * FROM system_logs ORDER BY created_at DESC LIMIT 10;"
``` 