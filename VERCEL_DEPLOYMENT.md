# Vercel Deployment Guide

## Overview

Deploy your Canadian Payroll System to Vercel in under 5 minutes with **automatic CI/CD**, **global CDN**, and **serverless functions**.

---

## **Step 1: Connect GitHub to Vercel**

1. **Go to**: https://vercel.com/new
2. **Click**: "Import Git Repository"
3. **Select**: `mjawaidca-prog/canadian-payroll`
4. **Click**: "Import"

---

## **Step 2: Configure Project Settings**

### Build & Output Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run build --ws`
- **Output Directory**: `packages/web/.next`
- **Install Command**: `npm install`

### Environment Variables

**For Staging (`develop` branch):**
```
NEXT_PUBLIC_API_URL=https://api-staging.payroll.example.com
DATABASE_URL=postgres://user:pass@staging-db:5432/payroll_staging
NODE_ENV=production
JWT_SECRET=<staging-secret-key>
```

**For Production (`main` branch):**
```
NEXT_PUBLIC_API_URL=https://api.payroll.example.com
DATABASE_URL=postgres://user:pass@prod-db:5432/payroll_prod
NODE_ENV=production
JWT_SECRET=<production-secret-key>
```

---

## **Step 3: Connect Database (Optional)**

### Option A: Use Vercel Postgres (Easiest)
1. Go to **Project → Settings → Data**
2. Click **"Create Database"**
3. Select **Postgres**
4. Vercel auto-populates `DATABASE_URL`

### Option B: Use Your Own Database
1. Get connection string from your provider (AWS RDS, Digital Ocean, etc.)
2. Add as `DATABASE_URL` environment variable

---

## **Step 4: Deploy**

1. **Click "Deploy"** button
2. **Wait for build** (~2-3 minutes)
3. **See deployment URL**: `https://canadian-payroll.vercel.app`

That's it! 🎉

---

## **Automatic Deployments**

After initial setup, Vercel automatically:

- ✅ Deploys on every `git push` to `main` → Production
- ✅ Deploys on every `git push` to `develop` → Staging
- ✅ Runs your GitHub Actions workflows
- ✅ Shows preview URLs on PRs

---

## **Configuration Files**

### vercel.json
- Defines build settings
- Configures API routes
- Sets security headers
- Manages redirects

### .env Variables
Set in **Vercel Project → Settings → Environment Variables**

---

## **Database Migrations on Deploy**

Add this to `vercel.json` to auto-run migrations:

```json
{
  "buildCommand": "npm run build --ws && npm run migration:run --workspace=packages/backend"
}
```

---

## **Monitoring & Logs**

### View Logs
- Go to **Deployments** tab
- Click **Logs** on latest deployment

### Performance Analytics
- **Analytics** tab shows:
  - Response times
  - Error rates
  - Geography distribution
  - Top paths

### Error Tracking
- Set up **Sentry** for error monitoring:
  ```
  NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
  ```

---

## **Custom Domain**

1. Go to **Settings → Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `payroll.example.com`)
4. Follow DNS instructions
5. Points to Vercel nameservers

---

## **SSL/HTTPS**

✅ **Automatic**: Vercel provides free SSL certificate for all domains

---

## **Preview Deployments**

Every PR automatically gets:
- ✅ Unique preview URL
- ✅ Full test environment
- ✅ Auto-rebuild on commits
- ✅ Comment with preview link

Example:
```
🔗 Preview: https://canadian-payroll-pr-123.vercel.app
```

---

## **Environment-Specific Configs**

### Staging URL
```
https://staging.payroll.example.com
```

### Production URL
```
https://payroll.example.com
```

### Preview URL (on PRs)
```
https://canadian-payroll-pr-123.vercel.app
```

---

## **Rollback to Previous Deployment**

1. Go to **Deployments**
2. Click "Redeploy" on an older deployment
3. Vercel re-deploys that version instantly

---

## **API Routes (Serverless Functions)**

Backend API runs as serverless functions:

```
https://canadian-payroll.vercel.app/api/organizations
https://canadian-payroll.vercel.app/api/organizations/{id}/employees
```

---

## **Automatic Backups**

**PostgreSQL backups:**
- Daily automatic backups
- 30-day retention
- Point-in-time recovery

**Enable in RDS:**
```bash
aws rds modify-db-instance \
  --db-instance-identifier payroll-prod \
  --backup-retention-period 30 \
  --preferred-backup-window "03:00-04:00"
```

---

## **Performance Optimization**

### Image Optimization
- Next.js auto-optimizes images
- Serves WebP to modern browsers
- Responsive sizes

### Edge Caching
- Static pages: 365 days
- API routes: 0 seconds (no cache)
- Configure in `next.config.js`:

```javascript
headers: async () => [
  {
    source: '/api/(.*)',
    headers: [
      { key: 'Cache-Control', value: 'no-cache' }
    ]
  }
]
```

---

## **Security Headers**

Already configured in `vercel.json`:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

---

## **Rate Limiting**

Add rate limiting middleware in backend:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## **Troubleshooting**

### Build Fails
```bash
# Clear cache and rebuild
npm run build --ws
vercel rebuild
```

### API Not Responding
- Check `NEXT_PUBLIC_API_URL` environment variable
- Ensure database `DATABASE_URL` is correct
- View logs in **Deployments → Logs**

### Slow Deployment
- Check dependencies size
- Optimize Docker images
- Use `--legacy-peer-deps` if needed

---

## **Scaling to Production**

When ready for production traffic:

1. **Add Pro Plan**
   - Unlimited deployments
   - Advanced analytics
   - Priority support

2. **Scale Database**
   - RDS: Larger instance class
   - Connection pooling via PgBouncer

3. **Add CDN**
   - Vercel's global edge network (included)
   - Serves content from 30+ regions

4. **Enable WAF**
   - Vercel Security → Web Application Firewall
   - DDoS protection included

---

## **Costs**

### Vercel (Free Tier Included)
- 100 GB bandwidth/month free
- Unlimited functions
- Automatic SSL

### Database (RDS)
- ~$20-50/month (t3.micro to small)
- Backups included
- Multi-AZ for HA ($2x cost)

**Total**: $20-100/month depending on scale

---

## **Next Steps**

1. ✅ Click "Deploy" button
2. ✅ Wait for build (2-3 minutes)
3. ✅ Visit your deployment URL
4. ✅ Test payroll functionality
5. ✅ Configure custom domain
6. ✅ Set up monitoring

---

**Deployment Complete! 🚀**

Your Canadian Payroll System is now live on Vercel with:
- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ Auto-scaling
- ✅ Monitoring included
- ✅ Database backups

---

**Document Version**: 1.0
**Last Updated**: January 2024
