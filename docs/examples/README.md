# Configuration Examples

This directory contains template files and configuration examples for the Pixora Craftt platform.

## Files

### `env.template`
Backend environment variables template. Copy to root as `.env`:
```bash
cp docs/examples/env.template .env
```

### `env.frontend.template`
Frontend environment variables template. Copy to frontend as `.env.local`:
```bash
cp docs/examples/env.frontend.template frontend/.env.local
```

## Automated Setup

Use the setup script to copy all templates automatically:
```bash
npm run setup
```

This will:
1. Install all workspace dependencies
2. Copy `env.template` to `.env`
3. Copy `env.frontend.template` to `frontend/.env.local`
4. Confirm setup completion

## Manual Configuration

After copying the templates, edit the environment files with your actual values:

- Database connection strings
- JWT secrets
- External service API keys
- SMTP configuration
- etc.

Refer to the individual template files for detailed configuration options. 