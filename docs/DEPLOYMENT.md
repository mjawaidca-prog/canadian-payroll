# Deployment Guide

## Overview

This document covers deploying the Canadian Payroll System to production environments.

## Deployment Options

### Option 1: AWS (Recommended for Enterprise)

**Architecture:**
- **Frontend**: CloudFront + S3
- **Backend**: ECS on Fargate
- **Database**: RDS PostgreSQL
- **Cache**: ElastiCache Redis

**Steps:**

1. **Set up AWS Account & CLI**
   ```bash
   aws configure
   # Enter: AWS Access Key, Secret Key, Region (us-east-1), Output (json)
   ```

2. **Create RDS Database**
   ```bash
   aws rds create-db-instance \
     --db-instance-identifier payroll-db \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --master-username postgres \
     --master-user-password YOUR_SECURE_PASSWORD \
     --allocated-storage 20 \
     --publicly-accessible false \
     --storage-encrypted true
   ```

3. **Build Docker Image**
   ```bash
   # Create Dockerfile (see below)
   docker build -t payroll-api:latest .
   docker tag payroll-api:latest YOUR_AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/payroll-api:latest
   
   # Push to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com
   docker push YOUR_AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/payroll-api:latest
   ```

4. **Deploy ECS Task**
   ```bash
   aws ecs create-service \
     --cluster payroll-cluster \
     --service-name payroll-api \
     --task-definition payroll-api:1 \
     --desired-count 2
   ```

### Option 2: Vercel (Best for Rapid Deployment)

**Setup:**

1. **Connect GitHub**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Vercel auto-detects Next.js

2. **Configure Environment**
   - Go to **Settings → Environment Variables**
   - Add for Staging:
     ```
     DATABASE_URL=postgres://user:pass@host:5432/payroll_staging
     NODE_ENV=production
     JWT_SECRET=your_secret
     ```
   - Add for Production:
     ```
     DATABASE_URL=postgres://user:pass@host:5432/payroll_prod
     NODE_ENV=production
     JWT_SECRET=your_production_secret
     ```

3. **Deploy**
   ```bash
   # Automatic on git push
   git push origin main  # Deploys to production
   git push origin develop  # Deploys to staging
   ```

### Option 3: Railway.app (Easiest Startup)

**Steps:**

1. **Connect GitHub**
   - Go to [railway.app](https://railway.app)
   - Login with GitHub
   - Create new project
   - Select "Deploy from GitHub repo"

2. **Add PostgreSQL**
   - Click "Add Service"
   - Select "PostgreSQL"
   - Railway creates database automatically

3. **Configure Backend**
   - Add service for backend
   - Set environment variables (see above)
   - Railway builds and deploys automatically

4. **View Logs**
   ```bash
   railway status  # Check deployment status
   railway logs    # View real-time logs
   ```

### Option 4: Docker Compose (Self-Hosted)

**Dockerfile:**

```dockerfile
# packages/backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY ./packages/backend/dist ./dist
COPY ./packages/backend/typeorm.config.js ./

# Run migrations
RUN npm run migration:run

# Start server
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

**Docker Compose:**

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: payroll_prod
      POSTGRES_USER: payroll
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build:
      context: .
      dockerfile: packages/backend/Dockerfile
    environment:
      DATABASE_URL: postgres://payroll:${DB_PASSWORD}@postgres:5432/payroll_prod
      NODE_ENV: production
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    restart: unless-stopped

volumes:
  postgres_data:
```

**Deploy:**

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests pass: `npm test`
- [ ] No linting errors: `npm run lint`
- [ ] Code coverage > 70%
- [ ] Security scan passed: `npm audit`

### Environment Setup
- [ ] Database credentials configured
- [ ] JWT secret generated and configured
- [ ] Email service configured (SendGrid/AWS SES)
- [ ] Environment variables set in CI/CD

### Database Migrations
- [ ] All pending migrations reviewed
- [ ] Rollback plan documented
- [ ] Backup created before migration
- [ ] Test migration on staging first

### Security
- [ ] HTTPS/TLS enabled
- [ ] API keys and secrets in environment variables
- [ ] Database encrypted at rest
- [ ] Backups encrypted
- [ ] CORS properly configured

### Monitoring
- [ ] Logging configured (CloudWatch/ELK)
- [ ] Error tracking enabled (Sentry)
- [ ] Performance monitoring set up (Datadog/New Relic)
- [ ] Uptime monitoring configured (Pingdom)
- [ ] Alerts configured for critical issues

### Documentation
- [ ] Deployment runbook created
- [ ] Rollback procedure documented
- [ ] Oncall escalation procedure defined
- [ ] Team trained on deployment process

## Deployment Process

### 1. Create Release Branch

```bash
git checkout -b release/v0.2.0
npm version minor
git push origin release/v0.2.0
```

### 2. Run Final Tests

```bash
npm test
npm run lint
npm run build
```

### 3. Create Release PR

```bash
# On GitHub, create PR: release/v0.2.0 → main
# Require code review and approval
```

### 4. Merge & Tag

```bash
# After approval, merge to main
git checkout main
git pull origin main

# Create tag
git tag v0.2.0
git push origin v0.2.0
```

### 5. Deploy to Production

```bash
# GitHub Actions automatically deploys on tag push
# Monitor deployment in Actions tab
```

### 6. Verify Deployment

```bash
# Check API health
curl https://payroll-api.example.com/health

# Check API status
curl https://payroll-api.example.com/api/status

# Monitor logs
docker-compose logs -f  # or CloudWatch/Vercel logs
```

## Rollback Procedure

If deployment fails:

```bash
# 1. Revert to previous tag
git reset --hard v0.1.0

# 2. Rebuild and redeploy
npm run build
docker-compose up -d --force-recreate

# 3. Verify services
curl http://localhost:3000/health

# 4. Check database (no migration needed for rollback)
psql -U payroll -d payroll_prod -c "SELECT VERSION();"

# 5. Notify team
# Slack/email notification of rollback
```

## Database Migration Strategy

### Safe Migration Pattern

```typescript
// Migration steps:
// 1. Add new column with default (non-breaking)
// 2. Deploy code that uses new column
// 3. Backfill existing rows (for large tables)
// 4. Make column NOT NULL (if needed)
// 5. Remove old code that uses old column
// 6. Drop old column (in future release)
```

### Example: Add New Field

```sql
-- Step 1: Add column with default
ALTER TABLE employees 
ADD COLUMN middle_name VARCHAR(100) DEFAULT '';

-- Step 2: Deploy new code using middle_name
-- Step 3: Backfill if needed
UPDATE employees SET middle_name = '' WHERE middle_name IS NULL;

-- Step 4: Make NOT NULL
ALTER TABLE employees 
ALTER COLUMN middle_name SET NOT NULL;
```

## Monitoring & Alerting

### Key Metrics to Monitor

1. **API Performance**
   - Response time (p50, p95, p99)
   - Requests per second
   - Error rate (4xx, 5xx)

2. **Database**
   - Connection pool utilization
   - Query execution time
   - Storage usage
   - Backup status

3. **Infrastructure**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network bandwidth

### Alert Thresholds

- Error rate > 1%: Warning
- Error rate > 5%: Critical
- Response time p95 > 500ms: Warning
- Response time p95 > 1000ms: Critical
- Database connection pool > 80%: Warning
- Disk usage > 85%: Warning

## Backup & Disaster Recovery

### Automated Backups

**AWS RDS:**
```bash
# Configure automated backups
aws rds modify-db-instance \
  --db-instance-identifier payroll-db \
  --backup-retention-period 30 \
  --preferred-backup-window "03:00-04:00"
```

**Manual Backup:**
```bash
# Create on-demand snapshot
aws rds create-db-snapshot \
  --db-instance-identifier payroll-db \
  --db-snapshot-identifier payroll-backup-$(date +%Y%m%d)
```

### Disaster Recovery Plan

**RTO (Recovery Time Objective)**: 1 hour
**RPO (Recovery Point Objective)**: 15 minutes

**Steps:**
1. Detect failure (automated alerting)
2. Assess impact (check logs/metrics)
3. Restore from backup
4. Verify database integrity
5. Smoke test critical endpoints
6. Notify stakeholders

## Scaling Strategy

### Vertical Scaling (Larger Instances)

```bash
# AWS RDS
aws rds modify-db-instance \
  --db-instance-identifier payroll-db \
  --db-instance-class db.t3.small
```

### Horizontal Scaling (Multiple Instances)

```bash
# Docker Swarm
docker service update --replicas 3 payroll-api

# Kubernetes
kubectl scale deployment payroll-api --replicas=3
```

## Cost Optimization

1. **Use spot instances** for non-critical workloads
2. **Right-size instances** based on metrics
3. **Enable auto-scaling** to handle peaks
4. **Use reserved instances** for baseline capacity
5. **Monitor unused resources** and shut down

## Post-Deployment

### Immediate (Day 1)
- [ ] Monitor error logs
- [ ] Verify user access
- [ ] Test critical features
- [ ] Check performance metrics

### Short-term (Week 1)
- [ ] Gather user feedback
- [ ] Monitor for regressions
- [ ] Validate all reports work
- [ ] Check tax calculations accuracy

### Ongoing
- [ ] Weekly log analysis
- [ ] Monthly cost review
- [ ] Quarterly disaster recovery drill
- [ ] Annual security audit

---

## Support & Emergency

**On-call**: 24/7 for production issues
**Escalation**: Team lead → CTO → CEO

**Emergency Hotline**: [Configure your process]

---

**Document Version**: 1.0
**Last Updated**: January 2024
