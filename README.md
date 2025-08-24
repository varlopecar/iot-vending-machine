# IoT Vending Machine

A modern IoT vending machine system built with a monorepo architecture using Turborepo. This project includes a backend API, mobile app, and web dashboard for managing and interacting with vending machines.

## 🏗️ Architecture

This project is organized as a monorepo with the following components:

### Apps

- **`backend`** - NestJS API server with tRPC integration
  - RESTful API endpoints for vending machine management
  - Real-time communication capabilities
  - Database integration with Prisma ORM
  - PostgreSQL database with Prisma Accelerate
  - Authentication and authorization
  - Loyalty points system
  - QR code generation and validation
  - **Stripe payment integration** with webhook handling
  - **Robust payment processing** with idempotency and error handling

- **`mobile`** - React Native mobile app (Expo)
  - Cross-platform mobile application
  - User interface for vending machine interactions
  - Real-time updates and notifications
  - QR code scanning for order pickup
  - Loyalty points management
  - **In-app payment processing** with Stripe

- **`web`** - Next.js web dashboard
  - Admin dashboard for vending machine management
  - Analytics and monitoring interface
  - Responsive web application
  - Back-office operations
  - **WCAG accessibility compliant** UI

### Packages

- **`@repo/eslint-config`** - Shared ESLint configuration
- **`@repo/typescript-config`** - Shared TypeScript configuration
- **`@repo/trpc`** - Shared tRPC router and types

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- pnpm (recommended package manager)
- Expo CLI (for mobile development)
- Turbo CLI (optional but recommended)

### Install Global Dependencies

```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm

# Install Turbo CLI globally (optional but recommended)
npm install -g turbo

# Install NestJS CLI globally
npm install -g @nestjs/cli

# Install Expo CLI globally
npm install -g @expo/cli
```

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd iot-vending-machine
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

Create a `.env` file in `apps/backend/` with your database URL and Stripe configuration:

```env
# Database
DATABASE_URL="your-prisma-accelerate-url-here"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_API_VERSION="2024-06-20"
```

## 🗄️ Database Setup

### Initial Setup

1. **Generate Prisma Client**:

```bash
cd apps/backend
npx prisma generate
```

2. **Run Database Migration**:

```bash
npx prisma migrate dev --name init
```

3. **Seed the Database** (optional):

```bash
pnpm seed
```

### Database Management

- **View Database**: `npx prisma studio`
- **Reset Database**: `npx prisma migrate reset`
- **Generate Client**: `npx prisma generate`

## 📱 Development

### Start all applications

```bash
# Start all apps in development mode
pnpm dev

# Or using turbo CLI directly
turbo dev
```

### Start specific applications

```bash
# Backend only
pnpm dev --filter=backend
# Or using turbo CLI
turbo dev --filter=backend

# Mobile app only
pnpm dev --filter=mobile
# Or using turbo CLI
turbo dev --filter=mobile

# Web dashboard only
pnpm dev --filter=web
# Or using turbo CLI
turbo dev --filter=web
```

### Build all applications

```bash
# Build all apps
pnpm build

# Or using turbo CLI directly
turbo build
```

### Linting and Type Checking

```bash
# Lint all code
pnpm lint

# Check TypeScript types
pnpm check-types

# Format code
pnpm format
```

## 🏃‍♂️ Running Individual Apps

### Backend (NestJS)

```bash
cd apps/backend
pnpm dev          # Development mode with hot reload
pnpm start        # Production mode
pnpm test         # Run tests
pnpm seed         # Seed database with sample data

# Stripe-specific commands
pnpm stripe:listen                    # Listen to Stripe webhooks locally
pnpm stripe:trigger:succeeded         # Trigger test payment success
pnpm stripe:trigger:failed            # Trigger test payment failure

# Database management
pnpm db:setup                         # Setup database with migrations and seed
pnpm db:migrate                       # Deploy migrations to production
```

### Mobile (React Native + Expo)

```bash
cd apps/mobile
pnpm dev          # Start Expo development server
pnpm android      # Run on Android emulator
pnpm ios          # Run on iOS simulator
pnpm web          # Run in web browser
```

### Web (Next.js)

```bash
cd apps/web
pnpm dev          # Development server (port 3001)
pnpm build        # Build for production
pnpm start        # Start production server
```

## 🛠️ Technology Stack

- **Monorepo**: Turborepo ^2.5.6
- **Backend**: NestJS ^11.0.1, tRPC, TypeScript, Prisma ORM ^6.13.0
- **Database**: PostgreSQL with Prisma Accelerate
- **Mobile**: React Native, Expo, TypeScript
- **Web**: Next.js 15, React 19, TypeScript
- **Package Manager**: pnpm ^9.0.0
- **Linting**: ESLint + Prettier
- **Testing**: Jest
- **Payments**: Stripe ^18.4.0 with webhook handling

## 🎯 Key Features

### Vending Machine Management

- Real-time stock tracking
- Machine status monitoring (online/offline/maintenance)
- Location-based machine discovery
- Slot management and inventory

### Order System

- Product reservation (max 2 products per order)
- QR code generation for pickup
- 30-minute order expiration
- Immediate stock decrement on order placement
- Order status tracking (pending/active/expired/used/cancelled)

### Payment Processing

- **Stripe integration** for secure payment processing
- **Webhook handling** for real-time payment status updates
- **Idempotency** to prevent duplicate transactions
- **Refund support** with partial and full refunds
- **Payment event logging** for audit trails

### Loyalty Program

- Point accumulation on purchases
- Point redemption for rewards
- Transaction history logging
- Barcode-based user identification

### Authentication & Security

- User registration and login
- Password hashing with bcrypt
- JWT token generation (ready for implementation)
- Input validation with Zod schemas

## 📁 Project Structure

```
iot-vending-machine/
├── apps/
│   ├── backend/          # NestJS API server
│   │   ├── src/
│   │   │   ├── auth/     # Authentication module
│   │   │   ├── products/ # Product management
│   │   │   ├── machines/ # Machine management
│   │   │   ├── orders/   # Order processing
│   │   │   ├── stocks/   # Inventory management
│   │   │   ├── loyalty/  # Loyalty system
│   │   │   ├── pickups/  # Pickup tracking
│   │   │   ├── payments/ # Payment processing
│   │   │   ├── stripe/   # Stripe integration
│   │   │   ├── webhooks/ # Webhook handling
│   │   │   ├── checkout/ # Checkout flow
│   │   │   └── prisma/   # Database service
│   │   ├── prisma/       # Database schema & migrations
│   │   └── package.json
│   ├── mobile/           # React Native mobile app
│   └── web/              # Next.js web dashboard
├── packages/
│   ├── eslint-config/    # Shared ESLint config
│   ├── typescript-config/ # Shared TypeScript config
│   └── trpc/             # Shared tRPC router
├── package.json
├── turbo.json
└── pnpm-workspace.yaml
```

## 🗄️ Database Schema Overview

### Core Entities

```sql
-- Users with loyalty points
users (id, full_name, email, password, points, barcode, created_at)

-- Product catalog
products (id, name, description, price, ingredients, allergens, nutritional_value, image_url, is_active)

-- Vending machines
machines (id, location, label, status, last_update)

-- Inventory management
stocks (id, machine_id, product_id, quantity, slot_number)

-- Orders with QR codes
orders (id, user_id, machine_id, status, created_at, expires_at, qr_code_token, stripe_payment_intent_id)

-- Order details
order_items (id, order_id, product_id, quantity, slot_number)

-- Pickup tracking
pickups (id, order_id, machine_id, picked_up_at, status)

-- Loyalty history
loyalty_logs (id, user_id, change, reason, created_at)

-- Payment processing
payments (id, order_id, stripe_payment_intent_id, amount_cents, currency, status, last_error_code, last_error_message)

-- Payment events
payment_events (id, payment_id, order_id, stripe_event_id, type, payload)

-- Refunds
refunds (id, payment_id, stripe_refund_id, amount_cents, reason, status)
```

## 🔧 Development Workflow

1. **Feature Development**: Create feature branches from main
2. **Database Changes**: Use Prisma migrations for schema changes
3. **Testing**: Run tests before committing changes
4. **Linting**: Ensure code passes linting rules
5. **Type Checking**: Verify TypeScript types are correct
6. **Build**: Ensure all apps build successfully

## 🚀 Deployment

### Backend Deployment (Scalingo)

The project uses automatic Scalingo deployment on push to the main branch:

- **Automatic deployment** on push to main
- **SSH ED25519 configuration** for secure deployment
- **Database migrations** run automatically
- **Environment variables** configured via Scalingo dashboard

### Manual Deployment Steps

1. **Build the NestJS application**: `pnpm build`
2. **Configure environment variables** in Scalingo dashboard
3. **Database migrations** run automatically via deployment hooks
4. **Health checks** ensure application is running correctly

### Mobile App Deployment

- Build the Expo app for production
- Submit to App Store and Google Play Store
- Configure app signing and certificates

### Web Dashboard Deployment

- Build the Next.js application
- Deploy to Vercel, Netlify, or your preferred hosting platform
- Configure environment variables

## 🧪 Testing the System

### Sample Data

The database seeder creates:

- **3 users** with different loyalty points
- **3 vending machines** in different locations
- **5 products** with realistic pricing
- **Sample orders** and loyalty transactions

### Test Credentials

Use these credentials to test the system:

- **Email**: `john@example.com`, `jane@example.com`, `bob@example.com`
- **Password**: `password123` (for all users)

### API Testing

The backend provides tRPC endpoints for:

- User authentication (register/login)
- Product browsing
- Order creation and management
- Stock monitoring
- Loyalty point operations
- Payment processing with Stripe

### Stripe Testing

```bash
# Test webhook locally
pnpm stripe:listen

# Trigger test events
pnpm stripe:trigger:succeeded
pnpm stripe:trigger:failed
```

## 🤝 Contributing

Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) file for detailed guidelines on how to contribute to this project.

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.

## 📋 Version History

See [CHANGELOG.md](./CHANGELOG.md) for a detailed history of changes and releases.
