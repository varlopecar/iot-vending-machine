# 🚀 Web Dashboard CI/CD Setup Guide

This guide will help you set up continuous integration and deployment for your IoT Vending Machine web dashboard using GitHub Actions and Vercel.

## 📋 Overview

The CI/CD pipeline includes:

- **Automated testing** on pull requests and pushes
- **Preview deployments** for pull requests
- **Staging deployments** from `develop` branch
- **Production deployments** from `main` branch
- **Type checking and linting** before deployment

## 🔧 Required Setup

### 1. Vercel Account & Project Setup

1. **Create a Vercel account** at [vercel.com](https://vercel.com)
2. **Import your GitHub repository** to Vercel:
   - Go to Vercel dashboard
   - Click "New Project"
   - Import your `iot-vending-machine` repository
   - Set the **Root Directory** to `apps/web`
   - Framework preset should auto-detect as **Next.js**

### 2. Get Required Tokens & IDs

#### A. Vercel Token

```bash
# Install Vercel CLI
npm i -g vercel

# Login to your account
vercel login

# Get your token
vercel tokens create "GitHub Actions Token"
```

#### B. Vercel Project Info

```bash
# Navigate to your web app directory
cd apps/web

# Link to your Vercel project using --repo flag for monorepos
vercel link --repo

# Get your Organization ID and Project ID
vercel env ls
```

Or find them in:

- **Organization ID**: Vercel dashboard → Settings → General
- **Project ID**: Project dashboard → Settings → General

### 3. GitHub Secrets Configuration

Add these secrets to your GitHub repository:

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add the following **Repository secrets**:

| Secret Name                      | Description                    | Example                           |
| -------------------------------- | ------------------------------ | --------------------------------- |
| `VERCEL_TOKEN`                   | Your Vercel deployment token   | `abcd1234...`                     |
| `VERCEL_ORG_ID`                  | Your Vercel organization ID    | `team_1234567890`                 |
| `VERCEL_PROJECT_ID`              | Your Vercel project ID         | `prj_1234567890`                  |
| `NEXT_PUBLIC_API_URL_STAGING`    | Backend API URL for staging    | `https://staging-api.yourapp.com` |
| `NEXT_PUBLIC_API_URL_PRODUCTION` | Backend API URL for production | `https://api.yourapp.com`         |

### 4. Vercel Environment Variables

In your Vercel project dashboard, add these environment variables:

#### Production Environment:

- `NEXT_PUBLIC_API_URL` = `https://your-backend-api.scalingo.io`

#### Preview Environment:

- `NEXT_PUBLIC_API_URL` = `https://your-staging-backend-api.scalingo.io`

## 🔄 How the Pipeline Works

### Pull Request Flow

1. **Triggered**: When you open/update a PR to `main` or `develop`
2. **Tests**: Runs type checking, linting, and build
3. **Preview Deploy**: Creates a preview deployment on Vercel
4. **Comment**: Adds a comment to the PR with the preview URL

### Staging Deployment (develop branch)

1. **Triggered**: When you push to `develop` branch
2. **Tests**: Runs all quality checks
3. **Deploy**: Deploys to Vercel preview environment

### Production Deployment (main branch)

1. **Triggered**: When you push to `main` branch
2. **Tests**: Runs all quality checks
3. **Deploy**: Deploys to Vercel production environment

## 🛠️ Testing the Setup

### 1. Test Preview Deployment

```bash
# Create a feature branch
git checkout -b feature/test-deployment

# Make a small change to the web app
echo "<!-- Test change -->" >> apps/web/app/page.tsx

# Commit and push
git add .
git commit -m "test: trigger preview deployment"
git push origin feature/test-deployment

# Create a pull request to main
```

### 2. Test Staging Deployment

```bash
# Merge your feature to develop
git checkout develop
git merge feature/test-deployment
git push origin develop
```

### 3. Test Production Deployment

```bash
# Merge develop to main
git checkout main
git merge develop
git push origin main
```

## 📁 File Structure

```
iot-vending-machine/
├── .github/workflows/
│   ├── backend-deploy.yml     # Backend CI/CD (existing)
│   └── web-deploy.yml         # Web CI/CD (new)
├── apps/web/
│   ├── vercel.json           # Vercel config for web app
│   └── ...                   # Your Next.js app
├── vercel.json               # Root Vercel config
└── WEB_DEPLOY_SETUP.md       # This guide
```

## 🔍 Monitoring Deployments

### GitHub Actions

- Monitor builds in the "Actions" tab of your GitHub repository
- Each deployment shows detailed logs and status

### Vercel Dashboard

- View deployment history and logs
- Monitor performance and analytics
- Manage domains and environment variables

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Fails - Module Not Found

```bash
# Solution: Ensure all dependencies are in package.json
cd apps/web
pnpm install
```

#### 2. Environment Variables Not Available

- Check Vercel dashboard environment variables
- Ensure GitHub secrets are correctly named
- Variables must be prefixed with `NEXT_PUBLIC_` for client-side access

#### 3. Deployment Takes Too Long

- Check build logs in Vercel dashboard
- Ensure your build command is optimized
- Consider enabling Vercel's build cache

#### 4. API Connection Issues

- Verify `NEXT_PUBLIC_API_URL` points to correct backend
- Ensure CORS is configured in your backend
- Check network policies if using private networks

### Getting Help

1. **Check GitHub Actions logs** for build/test failures
2. **Check Vercel deployment logs** for deployment issues
3. **Verify environment variables** in both GitHub and Vercel
4. **Test locally** with `pnpm dev` before deploying

## 🎯 Next Steps

After setup is complete:

1. **Configure custom domain** in Vercel (optional)
2. **Set up monitoring** and alerts
3. **Configure branch protection** rules in GitHub
4. **Add automated tests** to improve quality gates
5. **Set up database migrations** coordination with backend deployments

## 🔐 Security Best Practices

- ✅ Never commit secrets to your repository
- ✅ Use environment variables for all configuration
- ✅ Regularly rotate your Vercel tokens
- ✅ Enable branch protection rules
- ✅ Review deployment logs regularly
- ✅ Use HTTPS for all API connections

---

**Need help?** Check the GitHub Actions logs and Vercel deployment dashboard for detailed error messages.
