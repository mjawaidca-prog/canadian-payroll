# Installation & Setup Guide

## Prerequisites

- **Node.js**: 20.0.0 or later ([Download](https://nodejs.org))
- **npm**: 10.0.0 or later (comes with Node.js)
- **PostgreSQL**: 14 or later ([Download](https://www.postgresql.org/download/))
- **Git**: For version control
- **VS Code or similar IDE** (optional but recommended)

### Verify Installation

```bash
node --version    # Should be v20.0.0+
npm --version     # Should be 10.0.0+
psql --version    # Should be PostgreSQL 14.0+
git --version     # Should be 2.30.0+
```

## Step 1: Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/canadian-payroll.git
cd canadian-payroll
```

## Step 2: Install Dependencies

The project uses npm workspaces to manage dependencies across packages.

```bash
npm install
```

This installs dependencies for:
- `packages/backend` - Express API
- `packages/web` - React Dashboard
- `packages/desktop` - Electron App
- `packages/cli` - CLI Tool

## Step 3: Set Up PostgreSQL

### Create Database

```bash
# Using psql
psql -U postgres -c "CREATE DATABASE payroll_dev;"
psql -U postgres -c "CREATE USER payroll WITH PASSWORD 'payroll_dev_password';"
psql -U postgres -c "ALTER ROLE payroll WITH SUPERUSER;"
```

Or using pgAdmin GUI:
1. Open pgAdmin
2. Right-click Databases → Create → Database
3. Name: `payroll_dev`
4. Click Create

### Verify Connection

```bash
psql -U postgres -d payroll_dev -c "\dt"
# Should return "Did not find any relations"
```

## Step 4: Configure Environment

### Create .env Files

```bash
# Copy template for backend
cp packages/backend/.env.example packages/backend/.env

# Copy template for frontend (if needed)
# cp packages/web/.env.example packages/web/.env
```

### Edit Backend Configuration

Edit `packages/backend/.env`:

```bash
NODE_ENV=development
PORT=3000

# Database (match what you created above)
DB_HOST=localhost
DB_PORT=5432
DB_USER=payroll
DB_PASSWORD=payroll_dev_password
DB_NAME=payroll_dev

# JWT (generate a random string)
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRES_IN=24h

# Email (optional for now)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_password

# API URLs
API_BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
```

## Step 5: Run Database Migrations

### Install TypeORM CLI (if needed)

```bash
npm install -g typeorm
```

### Run Migrations

```bash
cd packages/backend
npm run migration:run
```

**Expected output:**
```
✓ CreateInitialSchema1701000000000 migration executed
✓ Database migrations completed successfully
```

### Verify Schema

```bash
psql -U payroll -d payroll_dev -c "\dt"
```

Should show:
- `organizations`
- `employees`
- `pay_runs`
- `pay_run_items`
- `tax_tables`

## Step 6: Seed Tax Tables (Optional)

Populate 2024 CRA tax brackets:

```bash
cd packages/backend
npm run seed:taxtables
```

This creates tax table entries for all provinces with 2024 rates.

## Step 7: Install Git Hooks

Enable pre-commit linting:

```bash
npm run prepare
```

This installs husky hooks for auto-linting on git commit.

## Step 8: Start Development Servers

### Terminal 1: Backend API

```bash
npm run backend:dev
```

**Expected output:**
```
✓ Payroll API server running on port 3000
  Health check: http://localhost:3000/health
  API Status: http://localhost:3000/api/status
```

### Terminal 2: Web Dashboard (optional)

```bash
npm run web:dev
```

**Expected output:**
```
ready - started server on 0.0.0.0:3001, url: http://localhost:3001
```

## Step 9: Verify Setup

### Test API Health

```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Test API Status

```bash
curl http://localhost:3000/api/status
```

**Response:**
```json
{
  "application": "Canadian Payroll System",
  "version": "0.1.0",
  "status": "running"
}
```

### Access Web Dashboard

Open browser: `http://localhost:3001`

## Troubleshooting

### PostgreSQL Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**
1. Check PostgreSQL is running: `psql --version` or check system services
2. Verify database credentials in `.env`
3. Ensure database was created: `createdb payroll_dev`
4. Check if port 5432 is correct: `netstat -an | grep 5432`

### Migration Error: "relation already exists"

If you run migrations twice, you may get:
```
QueryFailedError: relation "organizations" already exists
```

**Solutions:**
1. Drop and recreate database:
   ```bash
   psql -U postgres -c "DROP DATABASE payroll_dev;"
   psql -U postgres -c "CREATE DATABASE payroll_dev;"
   ```
2. Then rerun migrations

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**
1. Kill process on port 3000:
   ```bash
   # macOS/Linux
   lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
   
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```
2. Or change port in `.env`: `PORT=3001`

### npm Install Fails

```
npm ERR! code ERESOLVE
```

**Solutions:**
1. Clear npm cache: `npm cache clean --force`
2. Use legacy peer deps: `npm install --legacy-peer-deps`
3. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## Development Workflow

### Running All Services

```bash
# Terminal 1: Start backend
npm run backend:dev

# Terminal 2: Start frontend
npm run web:dev

# Terminal 3: Run tests
npm run test

# Terminal 4: Linting
npm run lint
```

### Making Database Changes

When you modify an entity (e.g., add a field to Employee):

```bash
cd packages/backend

# Generate migration from changes
npm run migration:generate -- src/database/migrations/AddFieldToEmployee

# Run the migration
npm run migration:run
```

### Running Tests

```bash
npm run test           # All packages
npm test -w packages/backend   # Backend only
```

### Linting

```bash
npm run lint          # Check all files
npm run lint:fix      # Auto-fix issues
npm run format        # Format with Prettier
```

## Environment Variables Reference

| Variable | Description | Default |
|---|---|---|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | API server port | `3000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | PostgreSQL user | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `postgres` |
| `DB_NAME` | Database name | `payroll_dev` |
| `JWT_SECRET` | Secret for JWT tokens | (required) |
| `JWT_EXPIRES_IN` | JWT expiration | `24h` |
| `SMTP_HOST` | Email SMTP server | (optional) |
| `SMTP_PORT` | Email SMTP port | `587` |
| `API_BASE_URL` | API base URL | `http://localhost:3000` |
| `FRONTEND_URL` | Frontend URL | `http://localhost:3001` |

## Next Steps

1. **Create first organization**: Use API to create organization
2. **Add employees**: Populate employee data
3. **Set up pay runs**: Create pay periods
4. **Calculate payroll**: Run payroll calculations
5. **Generate pay stubs**: Export PDF pay stubs

See [API Documentation](./API.md) for API endpoints.

## Support

For issues:
1. Check troubleshooting section above
2. Review error logs in console
3. Check database with `psql`
4. Create GitHub issue with error details

## Production Deployment

See [Deployment Guide](./DEPLOYMENT.md) for production setup.

---

**Last Updated**: January 2024
**Document Version**: 1.0
