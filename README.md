# IoT Vending Machine

A modern IoT vending machine system built with a monorepo architecture using Turborepo. This project includes a backend API, mobile app, and web dashboard for managing and interacting with vending machines.

## 🏗️ Architecture

This project is organized as a monorepo with the following components:

### Apps

- **`backend`** - NestJS API server with tRPC integration
  - RESTful API endpoints for vending machine management
  - Real-time communication capabilities
  - Database integration and business logic

- **`mobile`** - React Native mobile app (Expo)
  - Cross-platform mobile application
  - User interface for vending machine interactions
  - Real-time updates and notifications

- **`web`** - Next.js web dashboard
  - Admin dashboard for vending machine management
  - Analytics and monitoring interface
  - Responsive web application

### Packages

- **`@repo/eslint-config`** - Shared ESLint configuration
- **`@repo/typescript-config`** - Shared TypeScript configuration

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
pnpm add -g turbo

# Install NestJS CLI globally
pnpm add -g @nestjs/cli

# Install Expo CLI globally
pnpm add -g @expo/cli
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

3. Set up environment variables (create `.env` files in each app directory as needed)

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
- **Backend**: NestJS, tRPC, TypeScript
- **Mobile**: React Native, Expo, TypeScript
- **Web**: Next.js 15, React 19, TypeScript
- **Package Manager**: pnpm
- **Linting**: ESLint + Prettier
- **Testing**: Jest

## 📁 Project Structure

```
iot-vending-machine/
├── apps/
│   ├── backend/          # NestJS API server
│   ├── mobile/           # React Native mobile app
│   └── web/              # Next.js web dashboard
├── packages/
│   ├── eslint-config/    # Shared ESLint config
│   └── typescript-config/ # Shared TypeScript config
├── package.json
├── turbo.json
└── pnpm-workspace.yaml
```

## 🔧 Development Workflow

1. **Feature Development**: Create feature branches from main
2. **Testing**: Run tests before committing changes
3. **Linting**: Ensure code passes linting rules
4. **Type Checking**: Verify TypeScript types are correct
5. **Build**: Ensure all apps build successfully

## 🚀 Deployment

### Backend Deployment

- Build the NestJS application
- Deploy to your preferred cloud platform (AWS, GCP, Azure, etc.)
- Configure environment variables and database connections

### Mobile App Deployment

- Build the Expo app for production
- Submit to App Store and Google Play Store
- Configure app signing and certificates

### Web Dashboard Deployment

- Build the Next.js application
- Deploy to Vercel, Netlify, or your preferred hosting platform
- Configure environment variables

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
