#!/bin/bash

# Canadian Payroll - GitHub Push Script
# This script automates pushing your code to GitHub

set -e

echo "🚀 Canadian Payroll - GitHub Push Script"
echo "=========================================="
echo ""

# Step 1: Verify git status
echo "Step 1️⃣ Checking git status..."
cd /tmp/canadian-payroll
git status

echo ""
echo "Step 2️⃣ Creating repository on GitHub..."
echo "❗ Please follow these steps manually:"
echo ""
echo "1. Go to: https://github.com/new"
echo "2. Fill in the form:"
echo "   - Repository name: canadian-payroll"
echo "   - Description: Canadian payroll software system"
echo "   - Visibility: Public (or Private)"
echo "   - ⚠️ DO NOT initialize with README"
echo "3. Click 'Create repository'"
echo ""
read -p "Press ENTER when you've created the repository on GitHub..."

echo ""
echo "Step 3️⃣ Configuring git remote..."
git remote add origin https://github.com/mjawaidca/canadian-payroll.git 2>/dev/null || \
git remote set-url origin https://github.com/mjawaidca/canadian-payroll.git

echo "✓ Remote configured"
echo ""

echo "Step 4️⃣ Renaming branch to 'main'..."
git branch -M main
echo "✓ Branch renamed to 'main'"
echo ""

echo "Step 5️⃣ Pushing code to GitHub..."
echo "This will push all 4 commits..."
git push -u origin main --verbose

echo ""
echo "Step 6️⃣ Verifying push..."
git log --oneline -n 5
git remote -v

echo ""
echo "✅ Success! Your code is now on GitHub!"
echo ""
echo "📊 Repository URL: https://github.com/mjawaidca/canadian-payroll"
echo "📋 Next: Check GitHub Actions for automated tests"
echo ""
