#!/bin/bash

# Setup script for Git hooks
# This script installs pre-push hooks for the IoT Vending Machine project

set -e

echo "🔧 Setting up Git hooks for IoT Vending Machine..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "turbo.json" ]; then
    echo "❌ This script must be run from the project root directory"
    exit 1
fi

# Make the pre-push hook executable
if [ -f ".git/hooks/pre-push" ]; then
    chmod +x .git/hooks/pre-push
    echo -e "${GREEN}✅${NC} Pre-push hook installed and made executable"
else
    echo "❌ Pre-push hook not found. Please ensure .git/hooks/pre-push exists"
    exit 1
fi

echo ""
echo -e "${BLUE}🎉 Git hooks setup complete!${NC}"
echo ""
echo "The following hooks are now active:"
echo "  • pre-push: Runs lint, test, and build for all projects"
echo ""
echo "To test the setup, try running:"
echo "  git push origin main"
echo ""
echo "The hook will automatically run:"
echo "  • pnpm lint:all"
echo "  • pnpm test:all" 
echo "  • pnpm build:all"
echo ""
echo "If any step fails, the push will be blocked until issues are fixed."
