# GitHub Setup & Push Instructions

## Step 1: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Fill in:
   - **Repository name**: `canadian-payroll`
   - **Description**: Canadian payroll software system with multi-platform support
   - **Visibility**: Public (or Private if preferred)
   - **Initialize**: Do NOT initialize with README (we already have one)
3. Click **Create repository**

## Step 2: Push to GitHub

After creating the repository, run these commands:

```bash
cd /tmp/canadian-payroll

# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/canadian-payroll.git

# Rename branch to main (optional but recommended)
git branch -M main

# Push to GitHub
git push -u origin main
```

### If You Already Have a Remote

```bash
# Update the remote URL
git remote set-url origin https://github.com/YOUR_USERNAME/canadian-payroll.git

# Push to GitHub
git push -u origin main
```

## Step 3: Verify Push

Check that everything is on GitHub:

```bash
# Check remote configuration
git remote -v

# Verify commits pushed
git log --oneline -5
```

You should see output like:
```
7f314f9 Phase 2: API Layer - Organizations & Employees
b662d5e Task 2 & 3: Setup Configs & Tax Documentation
07a6432 Phase 1: Foundation - Canadian Payroll System
```

## Step 4: Configure GitHub Settings

### Enable CI/CD

1. Go to your repository
2. **Settings → Actions → General**
3. Enable "Allow all actions and reusable workflows"

### Set up Deployment Secrets (Optional)

If you want automated deployment, add these secrets:

1. Go to **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Add:
   - `STAGING_DEPLOY_KEY`: Your deployment key
   - `STAGING_DEPLOY_URL`: Your staging server URL
   - `PRODUCTION_DEPLOY_KEY`: Your production key
   - `PRODUCTION_DEPLOY_URL`: Your production server URL
   - `SNYK_TOKEN`: Snyk security token (optional)
   - `SLACK_WEBHOOK`: Slack webhook for notifications (optional)

### Configure Branch Protection (Optional)

1. Go to **Settings → Branches**
2. Click **Add rule** under "Branch protection rules"
3. Set:
   - Branch pattern: `main`
   - Require pull request reviews
   - Require status checks to pass before merging
   - Include:
     - ✓ Lint and Test
     - ✓ Security Scan

## Step 5: Set up Deploy Environments (Optional)

1. Go to **Settings → Environments**
2. Create **staging** environment:
   - Deployment branches: `develop`
   - Required reviewers: (optional)
3. Create **production** environment:
   - Deployment branches: `main`
   - Required reviewers: (recommended)

## Step 6: Verify CI/CD Pipeline

1. Go to **Actions** tab
2. You should see workflow runs for:
   - **Lint and Test** - runs on every push/PR
   - **Deploy** - runs on main/develop

## Step 7: Set Default Branch

1. Go to **Settings → General**
2. Under "Default branch", ensure `main` is selected

## Troubleshooting

### "fatal: remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/canadian-payroll.git
```

### "Permission denied (publickey)"

You need to set up SSH keys:

```bash
# Generate new SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to SSH agent (macOS/Linux)
ssh-add ~/.ssh/id_ed25519

# Copy key to GitHub Settings → SSH and GPG keys
cat ~/.ssh/id_ed25519.pub  # Copy this
```

Or use HTTPS with personal access token:

```bash
git remote set-url origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/YOUR_USERNAME/canadian-payroll.git
```

### Commits Not Showing Up

```bash
# Verify commits exist locally
git log --oneline

# Force push if needed (use with caution)
git push -u origin main --force
```

## Next Steps After Push

1. Create a **develop** branch for ongoing development
2. Create GitHub Issues for features/bugs
3. Set up branch protection rules
4. Invite collaborators (if working in a team)
5. Enable GitHub Pages for documentation (optional)

---

## Repository Structure on GitHub

After successful push, your repository will have:

```
canadian-payroll/
├── .github/workflows/
│   ├── lint-and-test.yml      ← Runs on every push/PR
│   └── deploy.yml             ← Runs on main/develop
├── packages/
│   ├── backend/
│   ├── web/
│   ├── desktop/
│   └── cli/
├── docs/
│   ├── API.md
│   ├── INSTALLATION.md
│   ├── TAX_CALCULATION_GUIDE.md
│   └── DEPLOYMENT.md
├── README.md
├── package.json
└── ...
```

---

## CI/CD Pipeline Overview

### On Every Pull Request/Push to develop:
1. ✓ Install dependencies
2. ✓ Run ESLint & Prettier checks
3. ✓ Run Jest unit tests
4. ✓ Upload coverage to Codecov
5. ✓ Run security scan

### On Merge to main:
1. ✓ All above tests
2. ✓ Build for production
3. ✓ Deploy to staging
4. ✓ Deploy to production (with approval)
5. ✓ Notify via Slack (if configured)

---

## Monitoring Deployments

Once pushed to GitHub:

1. **View CI/CD Status**:
   - Go to **Actions** tab
   - Click on workflow run
   - See real-time build status

2. **View Test Coverage**:
   - Go to **Codecov** (codecov.io)
   - Link your GitHub account
   - See coverage reports

3. **Security Scanning**:
   - Go to **Security** → **Code scanning**
   - View vulnerabilities found by security scan

---

## Working with Branches

After initial push, use this workflow:

```bash
# Create feature branch
git checkout -b feature/add-pay-stub-generation

# Make commits
git add .
git commit -m "Add PDF generation for pay stubs"

# Push to GitHub
git push -u origin feature/add-pay-stub-generation

# Create Pull Request on GitHub
# (GitHub will show "Compare & pull request" button)

# After review and approval, merge to develop
# Then merge develop to main for production
```

---

**Document Version**: 1.0
**Last Updated**: January 2024
