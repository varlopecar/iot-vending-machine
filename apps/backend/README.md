# IoT Vending Machine - Backend API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

A NestJS backend API for the IoT Vending Machine platform, providing real-time vending machine management, order processing, loyalty programs, and user authentication.

## 🏗️ Architecture

This backend is built with:

- **NestJS** - Progressive Node.js framework
- **tRPC** - End-to-end type-safe APIs
- **Prisma ORM** - Database toolkit and ORM
- **PostgreSQL** - Primary database with Prisma Accelerate
- **bcrypt** - Password hashing
- **Zod** - Schema validation

## 🗄️ Database Schema

The system manages the following entities:

- **Users** - Customer accounts with loyalty points and barcodes
- **Products** - Product catalog with nutritional information
- **Machines** - Vending machine locations and status
- **Stocks** - Inventory levels per machine and product
- **Orders** - Order records with QR codes and expiration
- **Order Items** - Individual items in orders
- **Pickups** - Pickup tracking and completion
- **Loyalty Logs** - Loyalty point operation history

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18
- pnpm package manager
- PostgreSQL database (or Prisma Accelerate)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database with sample data
pnpm seed

# Run the Prisma Studio
npx prisma studio
```

### Development

```bash
# Development mode with hot reload
pnpm dev

# Production mode
pnpm start

# Build for production
pnpm build
```

## 📡 API Endpoints

The backend provides tRPC endpoints organized into modules:

### Authentication (`/auth`)

- `register` - User registration
- `login` - User authentication
- `getUserById` - Get user by ID
- `getUserByBarcode` - Get user by barcode
- `updateUser` - Update user profile
- `updatePoints` - Update loyalty points

### Products (`/products`)

- `getAllProducts` - List all products
- `getProductById` - Get product details
- `createProduct` - Create new product
- `updateProduct` - Update product
- `deleteProduct` - Delete product

### Machines (`/machines`)

- `getAllMachines` - List all machines
- `getMachineById` - Get machine details
- `getMachinesByLocation` - Find machines by location
- `updateMachineStatus` - Update machine status

### Stocks (`/stocks`)

- `getStocksByMachine` - Get inventory for a machine
- `updateStock` - Update stock levels
- `getLowStockAlerts` - Get low stock notifications

### Orders (`/orders`)

- `createOrder` - Create new order
- `getUserOrders` - Get user's order history
- `getOrderById` - Get order details
- `cancelOrder` - Cancel an order
- `validateQRCode` - Validate QR code for pickup

### Pickups (`/pickups`)

- `recordPickup` - Record order pickup
- `getPickupHistory` - Get pickup history

### Loyalty (`/loyalty`)

- `getUserPoints` - Get user's loyalty points
- `addPoints` - Add points to user account
- `deductPoints` - Deduct points from user account
- `getLoyaltyHistory` - Get loyalty transaction history

## 🎯 Key Features

### Vending Machine Management

- Real-time stock tracking across all machines
- Machine status monitoring (online/offline/maintenance)
- Location-based machine discovery
- Slot management and inventory control

### Order System

- Product reservation with maximum 2 products per order
- QR code generation for secure pickup
- 30-minute order expiration system
- Immediate stock decrement on order placement
- Comprehensive order status tracking

### Loyalty Program

- Point accumulation on purchases
- Point redemption for rewards
- Complete transaction history logging
- Barcode-based user identification

### Security & Validation

- User registration and authentication
- Password hashing with bcrypt
- Input validation with Zod schemas
- Type-safe API communication via tRPC

## 🗄️ Database Management

### Prisma Commands

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name <migration-name>

# Reset database (development only)
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio

# Deploy migrations to production
npx prisma migrate deploy
```

### Environment Variables

```env
# Database connection
DATABASE_URL="your-prisma-accelerate-url-here"

# JWT secret (for future implementation)
JWT_SECRET="your-jwt-secret"

# Server configuration
PORT=3000
NODE_ENV=development
```

## 🧪 Testing

### Sample Data

The seeder creates:

- **3 users** with different loyalty points
- **3 vending machines** in different locations
- **5 products** with realistic pricing and nutritional info
- **Sample orders** and loyalty transactions

### Test Credentials

```bash
# Test users
Email: john@example.com, jane@example.com, bob@example.com
Password: password123 (for all users)
```

### Running Tests

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## 📁 Project Structure

```
src/
├── auth/           # Authentication module
│   ├── auth.module.ts
│   ├── auth.router.ts
│   ├── auth.schema.ts
│   └── auth.service.ts
├── products/       # Product management
├── machines/       # Machine management
├── orders/         # Order processing
├── stocks/         # Inventory management
├── loyalty/        # Loyalty system
├── pickups/        # Pickup tracking
├── prisma/         # Database service
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── app.module.ts   # Main application module
└── main.ts         # Application entry point

prisma/
├── schema.prisma   # Database schema
├── migrations/     # Database migrations
└── seed.ts         # Database seeder
```

## 🚀 Deployment

### Production Build

```bash
# Build the application
pnpm build

# Start production server
pnpm start:prod
```

### Environment Setup

1. Set up PostgreSQL database or Prisma Accelerate
2. Configure environment variables
3. Run database migrations: `npx prisma migrate deploy`
4. Deploy to your preferred platform (AWS, GCP, Azure, etc.)

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install -g pnpm
RUN pnpm install
COPY . .
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start:prod"]
```

## 🔧 Development

### Code Quality

```bash
# Lint code
pnpm lint

# Format code
pnpm format

# Type checking
pnpm check-types
```

### Database Development

```bash
# Reset and seed database
pnpm db:reset

# View database
npx prisma studio

# Generate new migration
npx prisma migrate dev --name <description>
```

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
