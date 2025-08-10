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

- **`mobile`** - React Native mobile app (Expo)
  - Cross-platform mobile application
  - User interface for vending machine interactions
  - Real-time updates and notifications
  - QR code scanning for order pickup
  - Loyalty points management

- **`web`** - Next.js web dashboard
  - Admin dashboard for vending machine management
  - Analytics and monitoring interface
  - Responsive web application
  - Back-office operations

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

Create a `.env` file in `apps/backend/` with your database URL:

```env
DATABASE_URL="your-prisma-accelerate-url-here"
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

- **Monorepo**: Turborepo
- **Backend**: NestJS, tRPC, TypeScript, Prisma ORM
- **Database**: PostgreSQL with Prisma Accelerate
- **Mobile**: React Native, Expo, TypeScript
- **Web**: Next.js 15, React 19, TypeScript
- **Package Manager**: pnpm
- **Linting**: ESLint + Prettier
- **Testing**: Jest

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
orders (id, user_id, machine_id, status, created_at, expires_at, qr_code_token)

-- Order details
order_items (id, order_id, product_id, quantity, slot_number)

-- Pickup tracking
pickups (id, order_id, machine_id, picked_up_at, status)

-- Loyalty history
loyalty_logs (id, user_id, change, reason, created_at)
```

## 🔧 Development Workflow

1. **Feature Development**: Create feature branches from main
2. **Database Changes**: Use Prisma migrations for schema changes
3. **Testing**: Run tests before committing changes
4. **Linting**: Ensure code passes linting rules
5. **Type Checking**: Verify TypeScript types are correct
6. **Build**: Ensure all apps build successfully

## 🚀 Deployment

### Backend Deployment

- Build the NestJS application: `pnpm build`
- Deploy to your preferred cloud platform (AWS, GCP, Azure, etc.)
- Configure environment variables and database connections
- Run database migrations: `npx prisma migrate deploy`

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.
