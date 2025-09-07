#!/bin/bash

# Script to help set up GitHub Actions deployment to Scalingo
# This script helps you configure the necessary SSH key for automated deployment

set -e

echo "🔧 Setting up GitHub Actions deployment to Scalingo"
echo ""

# Check if we're in the right directory
if [ ! -f "scripts/deploy-backend.sh" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 Prerequisites:"
echo "1. You need to have a Scalingo account with SSH access configured"
echo "2. You need to have admin access to your GitHub repository"
echo ""

# Check if SSH key exists
SSH_KEY_PATH="$HOME/.ssh/id_rsa"
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo "⚠️  No SSH key found at $SSH_KEY_PATH"
    echo "   Please generate an SSH key first:"
    echo "   ssh-keygen -t rsa -b 4096 -C 'your-email@example.com'"
    echo ""
    read -p "Do you want to generate a new SSH key now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your email address: " email
        ssh-keygen -t rsa -b 4096 -C "$email" -f "$SSH_KEY_PATH"
        echo "✅ SSH key generated at $SSH_KEY_PATH"
    else
        echo "❌ Please generate an SSH key first and run this script again"
        exit 1
    fi
fi

echo "🔑 SSH Key found at $SSH_KEY_PATH"
echo ""

# Display the public key
echo "📋 Your public SSH key (copy this to Scalingo):"
echo "----------------------------------------"
cat "${SSH_KEY_PATH}.pub"
echo "----------------------------------------"
echo ""

echo "📋 Next steps:"
echo "1. Copy the public key above"
echo "2. Go to your Scalingo dashboard: https://dashboard.scalingo.com/"
echo "3. Navigate to your app: iot-vending-machine"
echo "4. Go to Settings > SSH Keys"
echo "5. Add the public key above"
echo ""

# Display the private key for GitHub Secrets
echo "🔐 Your private SSH key (copy this to GitHub Secrets):"
echo "----------------------------------------"
cat "$SSH_KEY_PATH"
echo "----------------------------------------"
echo ""

echo "📋 GitHub Secrets setup:"
echo "1. Go to your GitHub repository: https://github.com/your-username/iot-vending-machine"
echo "2. Go to Settings > Secrets and variables > Actions"
echo "3. Click 'New repository secret'"
echo "4. Name: SCALINGO_SSH_KEY"
echo "5. Value: Copy the private key above (including the BEGIN/END lines)"
echo ""

echo "✅ Setup complete!"
echo ""
echo "🚀 After completing the steps above:"
echo "- Push changes to the main branch"
echo "- GitHub Actions will automatically run tests, build, and deploy"
echo "- The deployment script will create an optimized backend-only package"
echo "- Your backend will be deployed to: https://iot-vending-machine.osc-fr1.scalingo.io"
echo ""
echo "📖 For more information, see the GitHub Actions workflow:"
echo "   .github/workflows/backend-deploy.yml"
