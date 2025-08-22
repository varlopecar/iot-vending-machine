#!/bin/bash

# EAS Deployment Setup Script
# This script helps set up the EAS deployment workflow

set -e

echo "🚀 Setting up EAS Deployment for IoT Vending Machine Mobile App"
echo "================================================================"

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI is not installed. Installing now..."
    npm install -g @expo/eas-cli
else
    echo "✅ EAS CLI is already installed"
fi

# Check if logged in to Expo
if ! eas whoami &> /dev/null; then
    echo "❌ Not logged in to Expo. Please run 'eas login' first."
    echo "You can get your access token from: https://expo.dev/accounts/[username]/settings/access-tokens"
    exit 1
else
    echo "✅ Logged in to Expo"
fi

# Check if we're in the mobile app directory
if [ ! -f "eas.json" ]; then
    echo "❌ eas.json not found. Please run this script from the apps/mobile directory."
    exit 1
fi

echo ""
echo "📋 Current EAS Configuration:"
echo "============================="
echo "Project ID: $(grep -o '"projectId": "[^"]*"' app.json | cut -d'"' -f4)"
echo "App Name: $(grep -o '"name": "[^"]*"' app.json | cut -d'"' -f4)"
echo "Bundle ID (iOS): $(grep -A5 '"ios"' app.json | grep -o '"bundleIdentifier": "[^"]*"' | cut -d'"' -f4)"
echo "Package (Android): $(grep -A5 '"android"' app.json | grep -o '"package": "[^"]*"' | cut -d'"' -f4)"

echo ""
echo "🔧 Available Build Profiles:"
echo "============================"
echo "1. development - For local development and testing"
echo "2. preview - For testing and QA"
echo "3. production - For app store releases"

echo ""
echo "📝 Next Steps:"
echo "=============="
echo "1. Add EXPO_TOKEN to GitHub Secrets:"
echo "   - Go to your GitHub repository"
echo "   - Settings > Secrets and variables > Actions"
echo "   - Add EXPO_TOKEN with your Expo access token"
echo ""
echo "2. (Optional) Configure store submission:"
echo "   - Add ANDROID_SERVICE_ACCOUNT_KEY for Google Play Store"
echo "   - Add APPLE_APP_SPECIFIC_PASSWORD for App Store Connect"
echo "   - Add APPLE_APPLE_ID and APPLE_TEAM_ID for iOS"
echo ""
echo "3. Test the workflow:"
echo "   - Create a pull request to trigger preview builds"
echo "   - Push to main branch to trigger production builds"
echo ""
echo "4. Manual deployment commands:"
echo "   cd apps/mobile"
echo "   pnpm build:preview     # Build preview version"
echo "   pnpm build:production  # Build production version"
echo "   pnpm deploy:production # Build and submit to stores"

echo ""
echo "📚 Documentation:"
echo "================="
echo "- EAS Build: https://docs.expo.dev/build/introduction/"
echo "- EAS Submit: https://docs.expo.dev/submit/introduction/"
echo "- GitHub Actions: https://docs.github.com/en/actions"

echo ""
echo "✅ Setup complete! The workflow will automatically trigger on:"
echo "- Pull requests: Preview builds"
echo "- Main branch pushes: Production builds and store submissions"
