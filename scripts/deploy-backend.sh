#!/bin/bash

# Script to deploy only the backend to Scalingo
# This creates a minimal deployment with only backend files
# Updated: Trigger deployment workflow

set -e

echo "🚀 Preparing backend-only deployment..."

# Create a temporary directory for backend deployment
TEMP_DIR=$(mktemp -d)
echo "📁 Created temporary directory: $TEMP_DIR"

# Create directory structure first
echo "📋 Creating directory structure..."
mkdir -p "$TEMP_DIR/apps/backend"
mkdir -p "$TEMP_DIR/packages/trpc/src"
mkdir -p "$TEMP_DIR/packages/typescript-config"

# Copy only backend-related files with aggressive exclusions
echo "📋 Copying backend files..."
rsync -av --exclude='node_modules' --exclude='dist' --exclude='coverage' --exclude='.turbo' --exclude='*.spec.ts' --exclude='*.test.ts' --exclude='__tests__' --exclude='*.md' --exclude='.cursor' --exclude='.scalingo' --exclude='scripts' --exclude='test-data.json' --exclude='auth-test.json' apps/backend/ "$TEMP_DIR/apps/backend/"

# Copy only essential packages (trpc and typescript-config) - source only
rsync -av --exclude='node_modules' --exclude='dist' --exclude='coverage' --exclude='*.md' --exclude='*.test.*' --exclude='*.spec.*' packages/trpc/src/ "$TEMP_DIR/packages/trpc/src/"
cp packages/trpc/package.json "$TEMP_DIR/packages/trpc/"
rsync -av --exclude='node_modules' --exclude='*.md' --exclude='*.test.*' --exclude='*.spec.*' packages/typescript-config/ "$TEMP_DIR/packages/typescript-config/"

# Copy minimal config files (no turbo.json to avoid turbo build)
cp pnpm-workspace.yaml "$TEMP_DIR/"
cp tsconfig.json "$TEMP_DIR/"

# Copy .dockerignore to exclude unnecessary files
cp .dockerignore "$TEMP_DIR/"

# Create a minimal package.json for the deployment
cat > "$TEMP_DIR/package.json" << 'EOF'
{
  "name": "iot-vending-machine-backend",
  "version": "1.0.0",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "engines": {
    "node": "18.x"
  },
  "scripts": {
    "build": "cd apps/backend && npm run build",
    "start": "cd apps/backend && npm run start:prod",
    "postinstall": "cd apps/backend && npm run postinstall"
  },
  "workspaces": [
    "apps/backend",
    "packages/trpc",
    "packages/typescript-config"
  ]
}
EOF

# Create .npmrc to handle peer dependency conflicts
cat > "$TEMP_DIR/.npmrc" << 'EOF'
legacy-peer-deps=true
auto-install-peers=true
EOF

# Skip generating lockfile - let Scalingo handle dependencies
echo "🔒 Skipping lockfile generation - Scalingo will handle dependencies..."

# Change to temp directory and initialize git repository
cd "$TEMP_DIR"
git init

# Configure git user for the deployment
git config user.email "deploy@iot-vending-machine.com"
git config user.name "Deployment Bot"

# Set the default branch to main
git branch -M main

git add .
git commit -m "Backend deployment $(date)"

# Add Scalingo remote
git remote add scalingo git@ssh.osc-fr1.scalingo.com:iot-vending-machine.git

echo "🚀 Deploying to Scalingo..."
git push scalingo main --force

# Cleanup
cd /Users/varlopecar/dev/iot-vending-machine
rm -rf "$TEMP_DIR"

echo "✅ Backend deployment completed!"
