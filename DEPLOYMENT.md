# Backend Deployment Guide

This guide explains how the backend is automatically deployed to Scalingo using GitHub Actions.

## 🚀 Automatic Deployment

The backend is automatically deployed when you push changes to the `main` branch that affect:

- `apps/backend/**` - Backend source code
- `packages/**` - Shared packages
- `pnpm-lock.yaml` - Dependencies
- `.github/workflows/backend-deploy.yml` - Deployment workflow

## 🔧 Setup (One-time)

### 1. Run the setup script

```bash
./scripts/setup-github-deployment.sh
```

This script will:

- Check for SSH keys
- Display your public key for Scalingo
- Display your private key for GitHub Secrets
- Provide step-by-step instructions

### 2. Configure Scalingo

1. Go to [Scalingo Dashboard](https://dashboard.scalingo.com/)
2. Navigate to your app: `iot-vending-machine`
3. Go to **Settings > SSH Keys**
4. Add the public SSH key displayed by the setup script

### 3. Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings > Secrets and variables > Actions**
3. Click **New repository secret**
4. Name: `SCALINGO_SSH_KEY`
5. Value: Copy the private SSH key (including BEGIN/END lines)

## 🔄 Deployment Process

When you push to `main`, GitHub Actions will:

1. **Test** - Run unit tests and type checking
2. **Build** - Compile the backend application
3. **Deploy** - Use the custom deployment script to:
   - Create a minimal, backend-only package
   - Exclude unnecessary files (mobile app, web app, tests)
   - Handle dependency conflicts
   - Push to Scalingo
4. **Verify** - Check that the deployment is healthy

## 📁 Deployment Script

The deployment script (`scripts/deploy-backend.sh`) creates an optimized package by:

- **Including only backend files** from `apps/backend/`
- **Including essential packages** (`packages/trpc`, `packages/typescript-config`)
- **Excluding unnecessary files**:
  - Mobile app (`apps/mobile`)
  - Web app (`apps/web`)
  - Test files (`*.spec.ts`, `*.test.ts`)
  - Build artifacts (`node_modules`, `dist`, `coverage`)
  - Development files

## 🛠️ Manual Deployment

If you need to deploy manually:

```bash
./scripts/deploy-backend.sh
```

## 🔍 Monitoring

- **GitHub Actions**: Check the Actions tab in your repository
- **Scalingo Dashboard**: Monitor deployment status
- **Health Check**: https://iot-vending-machine.osc-fr1.scalingo.io/health

## 🚨 Troubleshooting

### Deployment fails with dependency conflicts

The script handles NestJS v11 vs nestjs-trpc compatibility using `legacy-peer-deps=true`.

### SSH key issues

1. Ensure your SSH key is added to Scalingo
2. Verify the `SCALINGO_SSH_KEY` secret in GitHub
3. Check that the key has the correct permissions

### Build failures

1. Check the GitHub Actions logs
2. Ensure all tests pass locally
3. Verify the build works with `cd apps/backend && pnpm build`

## 📊 Deployment Benefits

- **Faster deployments** - Only backend files are deployed
- **Smaller package size** - Excludes unnecessary monorepo files
- **Automatic testing** - Tests run before deployment
- **Health verification** - Automatic health checks after deployment
- **Rollback capability** - Each deployment is tracked in Scalingo

## 🔗 URLs

- **Backend API**: https://iot-vending-machine.osc-fr1.scalingo.io
- **Health Check**: https://iot-vending-machine.osc-fr1.scalingo.io/health
- **Scalingo Dashboard**: https://dashboard.scalingo.com/
