#!/bin/bash

echo "🔧 Setting up optimized deployment..."

# Build the application
echo "📦 Building backend application..."
pnpm build

# Clean up unnecessary files to reduce image size
echo "🧹 Cleaning up unnecessary files..."

# Remove source files (keep only compiled output)
find src -name "*.ts" -not -name "*.d.ts" -delete

# Remove test files
find . -name "*.spec.ts" -delete
find . -name "*.test.ts" -delete
find . -name "__tests__" -type d -exec rm -rf {} + 2>/dev/null || true

# Remove development dependencies from node_modules
echo "📦 Removing dev dependencies..."
pnpm prune --prod

# Remove unnecessary files from node_modules
echo "🧹 Cleaning node_modules..."
find node_modules -name "*.md" -delete
find node_modules -name "*.ts" -delete
find node_modules -name "*.map" -delete
find node_modules -name "test" -type d -exec rm -rf {} + 2>/dev/null || true
find node_modules -name "tests" -type d -exec rm -rf {} + 2>/dev/null || true
find node_modules -name "docs" -type d -exec rm -rf {} + 2>/dev/null || true
find node_modules -name "examples" -type d -exec rm -rf {} + 2>/dev/null || true

# Remove TypeScript source files from dependencies
find node_modules -name "*.ts" -not -name "*.d.ts" -delete

echo "✅ Deployment setup completed!"
echo "📊 Current directory size:"
du -sh .

echo "📊 node_modules size:"
du -sh node_modules 2>/dev/null || echo "node_modules not found"
