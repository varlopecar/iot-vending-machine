#!/bin/bash

# 🚀 IoT Vending Machine Backend - Deployment Setup Script
# This script helps you set up the deployment configuration

set -e

echo "🚀 Setting up deployment for IoT Vending Machine Backend"
echo "========================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "src/main.ts" ]; then
    print_error "Please run this script from the backend directory (apps/backend)"
    exit 1
fi

print_status "Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm is not installed. Please install pnpm."
    exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git."
    exit 1
fi

print_success "Prerequisites check passed!"

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning "No .env file found. Creating from .env.example..."
    cp .env.example .env
    print_success "Created .env file from .env.example"
    print_warning "Please update .env with your actual values before deployment"
else
    print_success ".env file already exists"
fi

# Check if Prisma client is generated
if [ ! -d "node_modules/.prisma" ]; then
    print_status "Generating Prisma client..."
    pnpm prisma generate
    print_success "Prisma client generated"
else
    print_success "Prisma client already exists"
fi

# Test build
print_status "Testing build..."
if pnpm build; then
    print_success "Build test passed!"
else
    print_error "Build test failed! Please fix the issues before deployment."
    exit 1
fi

# Test linting
print_status "Testing linting..."
if pnpm lint; then
    print_success "Linting test passed!"
else
    print_warning "Linting issues found. Please fix them before deployment."
fi

# Test unit tests
print_status "Running unit tests..."
if pnpm test; then
    print_success "Unit tests passed!"
else
    print_warning "Some unit tests failed. Please review before deployment."
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Create your Scalingo app: https://dashboard.scalingo.com"
echo "2. Connect your GitHub repository to Scalingo"
echo "3. Set environment variables in Scalingo (see DEPLOYMENT.md)"
echo "4. Add GitHub secrets for CI/CD (see DEPLOYMENT.md)"
echo "5. Push to main branch to trigger deployment"
echo ""
echo "📚 Documentation:"
echo "- Deployment guide: DEPLOYMENT.md"
echo "- API documentation: API_ROUTES.md"
echo "- Payment system: PAYMENT_SYSTEM_SUMMARY.md"
echo ""
echo "🔧 Useful commands:"
echo "- Test locally: pnpm dev"
echo "- Run tests: pnpm test"
echo "- Check payments setup: pnpm check:payments"
echo "- View logs: pnpm logs"
echo ""
print_success "Ready for deployment! 🚀"
