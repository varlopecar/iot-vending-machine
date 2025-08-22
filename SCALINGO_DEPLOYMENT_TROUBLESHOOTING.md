# Scalingo Deployment Troubleshooting Guide

## 🚨 Current Issue: SSH Authentication Failure

The deployment is failing with the error:

```
Load key "/home/runner/.ssh/id_rsa": error in libcrypto
git@ssh.***.scalingo.com: Permission denied (publickey).
```

## 🔧 Fixes Applied

### 1. Improved SSH Key Setup

- Added proper key formatting with `tr -d '\r'` to remove carriage returns
- Added SSH connection testing
- Improved error handling and debugging

### 2. Alternative Deployment Method

- Added Scalingo CLI as a backup deployment method
- Automatic fallback if git subtree fails
- Better error reporting

### 3. Enhanced Debugging

- Added SSH configuration debugging step
- Better logging throughout the deployment process

## 🔑 Required GitHub Secrets

Make sure these secrets are properly configured in your GitHub repository:

### Required Secrets:

- `SCALINGO_SSH_PRIVATE_KEY`: Your private SSH key for Scalingo
- `SCALINGO_API_TOKEN`: Your Scalingo API token
- `SCALINGO_APP_NAME`: Your Scalingo app name (e.g., "iot-vending-machine")
- `SCALINGO_REGION`: Your Scalingo region (e.g., "osc-fr1")

## 🔍 SSH Key Format Requirements

Your SSH private key should be in the correct format:

### ✅ Correct Format:

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACB... (base64 content)
-----END OPENSSH PRIVATE KEY-----
```

### ❌ Common Issues:

1. **Extra newlines or spaces** - Remove any extra formatting
2. **Wrong key type** - Use OpenSSH format, not PEM
3. **Missing headers** - Must include BEGIN/END markers
4. **Carriage returns** - The fix handles this automatically

## 🛠️ Manual SSH Key Generation

If you need to generate a new SSH key:

```bash
# Generate a new SSH key pair
ssh-keygen -t ed25519 -C "your-email@example.com" -f scalingo_key

# Copy the public key to Scalingo
cat scalingo_key.pub

# Copy the private key to GitHub secrets
cat scalingo_key
```

## 🔧 Alternative Deployment Methods

### Method 1: Git Subtree (Primary)

```bash
git subtree push --prefix=apps/backend scalingo main
```

### Method 2: Scalingo CLI (Backup)

```bash
scalingo login --api-token $SCALINGO_API_TOKEN
scalingo --app iot-vending-machine --region osc-fr1 deploy apps/backend
```

### Method 3: Manual Git Push

```bash
# Clone the Scalingo repository
git clone git@ssh.osc-fr1.scalingo.com:iot-vending-machine.git scalingo-repo
cd scalingo-repo

# Copy backend files
cp -r ../apps/backend/* .

# Commit and push
git add .
git commit -m "Deploy backend update"
git push origin main
```

## 🚀 Testing Deployment Locally

Before pushing to GitHub, test the deployment locally:

```bash
# Test SSH connection
ssh -T git@ssh.osc-fr1.scalingo.com

# Test git subtree locally
git subtree push --prefix=apps/backend scalingo main
```

## 📋 Deployment Checklist

- [ ] SSH key is properly formatted and added to GitHub secrets
- [ ] SSH key is added to Scalingo account
- [ ] All required environment variables are set
- [ ] Scalingo app exists and is accessible
- [ ] Database migrations are ready
- [ ] Environment variables are configured in Scalingo

## 🔍 Debugging Steps

### 1. Check SSH Key Format

```bash
# In GitHub Actions, check the debug output
echo "SSH key content (first few lines):"
head -5 ~/.ssh/id_rsa
```

### 2. Test SSH Connection

```bash
ssh -vT git@ssh.osc-fr1.scalingo.com
```

### 3. Verify Scalingo Access

```bash
scalingo login --api-token $SCALINGO_API_TOKEN
scalingo apps
```

## 📞 Support

If issues persist:

1. Check Scalingo documentation: https://doc.scalingo.com/
2. Verify your Scalingo account permissions
3. Contact Scalingo support with your app name and region
4. Check GitHub Actions logs for detailed error messages

## 🔄 Next Steps

1. **Update GitHub Secrets** if needed
2. **Push the updated workflow** to trigger a new deployment
3. **Monitor the deployment logs** for any remaining issues
4. **Test the deployed application** once successful

The updated workflow should now handle SSH authentication issues more gracefully and provide better debugging information.
