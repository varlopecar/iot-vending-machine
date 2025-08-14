# 🚀 Backend Deployment Guide - Scalingo

This guide explains how to deploy the IoT Vending Machine backend to Scalingo using GitHub Actions CI/CD.

## 📋 Prerequisites

1. **Scalingo Account** - Create an account at [scalingo.com](https://scalingo.com)
2. **GitHub Repository** - Your code should be in a GitHub repository
3. **Scalingo CLI** - Install for local testing (optional)

## 🔧 Step 1: Create Scalingo App

### Via Scalingo Dashboard:

1. Go to [Scalingo Dashboard](https://dashboard.scalingo.com)
2. Click "New App"
3. Choose "Create a new app"
4. Select your GitHub repository
5. Choose the region closest to your users
6. Name your app (e.g., `iot-vending-machine-backend`)

### Via Scalingo CLI:

```bash
# Install Scalingo CLI
curl -O https://cli-dl.scalingo.com/install.sh
chmod +x install.sh
./install.sh

# Login to Scalingo
scalingo login

# Create app
scalingo create iot-vending-machine-backend
```

## 🔑 Step 2: Configure Environment Variables

**Important:** Do NOT set the `PORT` environment variable - Scalingo sets this automatically.

### Required Environment Variables:

```bash
# Database (Prisma Accelerate)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=your_api_key"

# JWT Secret (Generate a secure one)
JWT_SECRET="your-super-secure-jwt-key-for-production"

# Environment
NODE_ENV="production"

# Stripe Configuration (Production keys)
STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_live_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
STRIPE_API_VERSION="2024-06-20"

# QR Code Security
QR_SECRET="your-super-secure-qr-secret-for-production"
QR_TTL_SECONDS="600"
```

### How to Set Environment Variables:

#### Via Scalingo Dashboard:

1. Go to your app in Scalingo Dashboard
2. Click "Environment" tab
3. Add each variable one by one
4. Click "Save"

#### Via Scalingo CLI:

```bash
scalingo --app your-app-name env-set \
  DATABASE_URL="your-database-url" \
  JWT_SECRET="your-jwt-secret" \
  NODE_ENV="production" \
  STRIPE_SECRET_KEY="your-stripe-secret" \
  STRIPE_PUBLISHABLE_KEY="your-stripe-publishable" \
  STRIPE_WEBHOOK_SECRET="your-webhook-secret" \
  STRIPE_API_VERSION="2024-06-20" \
  QR_SECRET="your-qr-secret" \
  QR_TTL_SECONDS="600"
```

## 🔗 Step 3: Connect GitHub Repository

### Via Scalingo Dashboard:

1. Go to your app in Scalingo Dashboard
2. Click "Git" tab
3. Connect your GitHub repository
4. Select the `main` branch
5. Enable automatic deployments (optional)

## 🔐 Step 4: Configure GitHub Secrets

Add these secrets to your GitHub repository:

1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Add the following secrets:

```bash
# Scalingo Configuration
SCALINGO_APP_NAME="your-app-name"
SCALINGO_REGION="your-region"  # e.g., "osc-fr1"
SCALINGO_API_TOKEN="your-api-token"

# Database (for tests)
DATABASE_URL="your-test-database-url"
```

### How to Get Scalingo API Token:

1. Go to [Scalingo Dashboard](https://dashboard.scalingo.com)
2. Click your profile → "API Keys"
3. Create a new API key
4. Copy the token

## 🚀 Step 5: Deploy

### Manual Approval Deployment (Recommended):

1. Push your code to the `main` branch
2. GitHub Actions will automatically:
   - Run tests
   - Build the application
   - **Wait for manual approval**
3. **Manual approval required**:
   - Go to GitHub Actions tab
   - Click "Review deployments"
   - Review the deployment summary
   - Click "Approve and deploy"
4. **Automatic deployment**:
   - Deploys to Scalingo
   - **Runs Prisma setup automatically:**
     - `pnpm prisma migrate status`
     - `pnpm prisma migrate deploy`
     - `pnpm seed`
   - Verifies deployment
   - Sends notifications

### Setup Manual Approval:

See `MANUAL_APPROVAL_SETUP.md` for detailed instructions on setting up the approval process.

### Manual Deployment:

```bash
# Via Scalingo CLI
scalingo --app your-app-name deploy

# Or via Scalingo Dashboard
# Go to your app → "Deployments" → "Deploy"
```

## 🧪 Step 6: Verify Deployment

### Health Check:

```bash
# Check if the app is running
curl https://your-app-name.your-region.scalingo.io/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.45,
  "environment": "production",
  "database": "connected"
}
```

### API Endpoints:

```bash
# Test tRPC endpoint
curl https://your-app-name.your-region.scalingo.io/trpc/health

# Test webhook endpoint (should return 404 for GET)
curl https://your-app-name.your-region.scalingo.io/webhooks/stripe
```

## 🔄 Step 7: Configure Stripe Webhooks

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Create a new webhook endpoint
3. Set the URL to: `https://your-app-name.your-region.scalingo.io/webhooks/stripe`
4. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `refund.updated`
5. Copy the webhook secret and update `STRIPE_WEBHOOK_SECRET` in Scalingo

## 📊 Monitoring

### Scalingo Dashboard:

- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, response times
- **Deployments**: Deployment history and status

### Health Checks:

- **Basic**: `GET /health` - Quick health check
- **Ready**: `GET /health/ready` - Comprehensive health check

### Alerts:

Configure alerts in Scalingo for:

- High error rates
- High response times
- Memory usage
- CPU usage

## 🗄️ Prisma Database Deployment

### Automatic Prisma Setup:

The deployment process automatically handles Prisma database operations:

1. **Pre-deployment Check** (GitHub Actions):
   - `pnpm prisma migrate status` - Checks migration status

2. **Post-deployment Setup** (Scalingo):
   - `pnpm prisma migrate status` - Verifies migration status
   - `pnpm prisma migrate deploy` - Applies pending migrations
   - `pnpm seed` - Seeds the database with initial data

### Manual Prisma Operations:

If you need to run Prisma operations manually:

```bash
# Connect to Scalingo app
scalingo --app your-app-name run bash

# Check migration status
pnpm prisma migrate status

# Apply migrations
pnpm prisma migrate deploy

# Seed database
pnpm seed

# Generate Prisma client
pnpm prisma generate
```

### Database Connection:

The app uses Prisma Accelerate for database connections:

- **Development**: Direct PostgreSQL connection
- **Production**: Prisma Accelerate connection (configured via `DATABASE_URL`)

## 🐛 Troubleshooting

### Common Issues:

#### 1. Build Fails

```bash
# Check build logs in Scalingo Dashboard
# Common issues:
# - Missing dependencies
# - TypeScript compilation errors
# - Environment variables not set
```

#### 2. App Won't Start

```bash
# Check startup logs
# Common issues:
# - Database connection failed
# - Invalid environment variables
# - Port conflicts (shouldn't happen with PORT)
```

#### 3. Database Connection Issues

```bash
# Verify DATABASE_URL is correct
# Check if Prisma Accelerate is accessible
# Ensure database migrations are applied
```

#### 4. Stripe Webhook Issues

```bash
# Verify webhook URL is correct
# Check webhook secret matches
# Test with Stripe CLI locally first
```

### Debug Commands:

```bash
# View logs
scalingo --app your-app-name logs

# Check environment variables
scalingo --app your-app-name env

# Restart app
scalingo --app your-app-name restart

# Run database migrations
scalingo --app your-app-name run npm run db:migrate
```

## 🔒 Security Considerations

### Environment Variables:

- ✅ Never commit secrets to Git
- ✅ Use strong, unique secrets for production
- ✅ Rotate secrets regularly
- ✅ Use different secrets for each environment

### Database:

- ✅ Use Prisma Accelerate for connection pooling
- ✅ Enable SSL connections
- ✅ Use strong passwords
- ✅ Regular backups

### API Security:

- ✅ CORS properly configured
- ✅ Rate limiting (consider adding)
- ✅ Input validation with Zod
- ✅ JWT token validation

## 📈 Scaling

### Automatic Scaling:

Scalingo automatically scales based on:

- CPU usage
- Memory usage
- Response times
- Number of requests

### Manual Scaling:

```bash
# Scale to 2 instances
scalingo --app your-app-name scale web:2

# Scale to larger instance
scalingo --app your-app-name scale web:S
```

## 🎉 Success!

Your backend is now deployed and ready to serve your IoT Vending Machine platform!

### Next Steps:

1. **Test all endpoints** with your mobile app
2. **Monitor performance** and logs
3. **Set up alerts** for critical issues
4. **Configure custom domain** (optional)
5. **Set up SSL certificates** (automatic with Scalingo)

---

**Need Help?**

- [Scalingo Documentation](https://doc.scalingo.com)
- [NestJS Documentation](https://docs.nestjs.com)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
