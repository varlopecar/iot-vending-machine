# Contributing to IoT Vending Machine

Thank you for your interest in contributing to the IoT Vending Machine project! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

We welcome contributions from the community! Whether you're fixing a bug, adding a feature, or improving documentation, your help is appreciated.

### Types of Contributions

- **Bug fixes** - Help us squash bugs and improve stability
- **Feature development** - Add new functionality to the platform
- **Documentation** - Improve README, API docs, or code comments
- **Testing** - Add tests or improve test coverage
- **Performance improvements** - Optimize code or database queries
- **Accessibility** - Improve WCAG compliance and user experience
- **Security** - Identify and fix security vulnerabilities

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js >= 18
- pnpm (recommended package manager)
- Git
- Basic knowledge of the tech stack (NestJS, React Native, Next.js)

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/iot-vending-machine.git
   cd iot-vending-machine
   ```
3. **Install dependencies**:
   ```bash
   pnpm install
   ```
4. **Set up environment variables**:
   ```bash
   cp apps/backend/env.example apps/backend/.env
   # Edit .env with your configuration
   ```
5. **Set up the database**:
   ```bash
   cd apps/backend
   npx prisma generate
   npx prisma migrate dev
   pnpm seed
   ```

## 🔧 Development Workflow

### 1. Create a Feature Branch

Always create a new branch for your changes:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
# or
git checkout -b docs/your-documentation-update
```

**Branch naming conventions:**

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

### 2. Make Your Changes

Follow these guidelines when making changes:

#### Code Style

- **TypeScript**: Use strict typing, avoid `any`
- **Naming**: Use descriptive names for variables, functions, and files
- **Comments**: Add JSDoc comments for public APIs
- **Formatting**: Use Prettier for consistent formatting

#### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples:**

```bash
git commit -m "feat(auth): add JWT token refresh endpoint"
git commit -m "fix(mobile): resolve navigation crash on iOS"
git commit -m "docs(readme): update installation instructions"
```

### 3. Testing

Before submitting your changes, ensure:

#### Backend Testing

```bash
cd apps/backend
pnpm test              # Run all tests
pnpm test:watch        # Run tests in watch mode
pnpm test:cov          # Run tests with coverage
```

#### Frontend Testing

```bash
# Web app
cd apps/web
pnpm test

# Mobile app
cd apps/mobile
pnpm test
```

#### Linting and Type Checking

```bash
# From root directory
pnpm lint              # Lint all code
pnpm check-types       # Check TypeScript types
pnpm format            # Format code with Prettier
```

### 4. Database Changes

When making database schema changes:

1. **Create a migration**:

   ```bash
   cd apps/backend
   npx prisma migrate dev --name descriptive-migration-name
   ```

2. **Update the schema** in `apps/backend/prisma/schema.prisma`

3. **Generate Prisma client**:

   ```bash
   npx prisma generate
   ```

4. **Test migrations**:
   ```bash
   npx prisma migrate reset  # Reset and reapply all migrations
   ```

### 5. Payment Integration

When working with Stripe integration:

1. **Use test keys** for development
2. **Test webhooks** locally:
   ```bash
   pnpm stripe:listen
   ```
3. **Trigger test events**:
   ```bash
   pnpm stripe:trigger:succeeded
   pnpm stripe:trigger:failed
   ```

## 📋 Pull Request Process

### 1. Prepare Your PR

1. **Ensure all tests pass** locally
2. **Update documentation** if needed
3. **Add tests** for new functionality
4. **Update CHANGELOG.md** with your changes

### 2. Create the Pull Request

1. **Push your branch** to your fork
2. **Create a PR** against the `main` branch
3. **Fill out the PR template** with:
   - Description of changes
   - Type of change (feature, fix, etc.)
   - Testing performed
   - Screenshots (if UI changes)

### 3. PR Review Process

- **Automated checks** must pass (linting, tests, builds)
- **Code review** by maintainers
- **Address feedback** and make requested changes
- **Squash commits** if requested

### 4. Merge Requirements

Your PR will be merged when:

- ✅ All automated checks pass
- ✅ Code review is approved
- ✅ Documentation is updated
- ✅ Tests are added/updated
- ✅ CHANGELOG.md is updated

## 🎯 Development Guidelines

### Backend (NestJS)

#### Module Structure

```
src/
├── module-name/
│   ├── module-name.module.ts
│   ├── module-name.router.ts
│   ├── module-name.schema.ts
│   ├── module-name.service.ts
│   └── module-name.controller.ts (if needed)
```

#### Service Guidelines

- Use dependency injection
- Implement proper error handling
- Add logging for important operations
- Use Prisma transactions for data consistency

#### API Design

- Follow RESTful principles
- Use tRPC for type-safe APIs
- Implement proper validation with Zod
- Add comprehensive error responses

### Frontend (React Native & Next.js)

#### Component Guidelines

- Use functional components with hooks
- Implement proper TypeScript types
- Follow accessibility guidelines (WCAG)
- Use consistent styling patterns

#### State Management

- Use React Context for global state
- Keep component state local when possible
- Implement proper loading and error states

### Database

#### Schema Guidelines

- Use descriptive table and column names
- Add proper indexes for performance
- Implement foreign key constraints
- Use appropriate data types

#### Migration Guidelines

- Make migrations reversible when possible
- Test migrations on sample data
- Document breaking changes

## 🧪 Testing Guidelines

### Backend Testing

- **Unit tests** for services and utilities
- **Integration tests** for API endpoints
- **E2E tests** for critical user flows
- **Test coverage** should be >80%

### Frontend Testing

- **Component tests** for UI components
- **Integration tests** for user flows
- **Accessibility tests** for WCAG compliance

### Test Naming

```typescript
describe("UserService", () => {
  describe("createUser", () => {
    it("should create a new user with valid data", () => {
      // test implementation
    });

    it("should throw error for invalid email", () => {
      // test implementation
    });
  });
});
```

## 🔒 Security Guidelines

### General Security

- **Never commit secrets** (API keys, passwords)
- **Use environment variables** for configuration
- **Validate all inputs** from users
- **Implement proper authentication** and authorization

### Payment Security

- **Use Stripe's secure methods** for payment processing
- **Validate webhook signatures**
- **Implement idempotency** for payment operations
- **Log payment events** for audit trails

## 📚 Documentation Guidelines

### Code Documentation

- **JSDoc comments** for public APIs
- **Inline comments** for complex logic
- **README updates** for new features
- **API documentation** with examples

### Commit Documentation

- **Clear commit messages** following conventional commits
- **CHANGELOG updates** for user-facing changes
- **Migration documentation** for database changes

## 🚨 Common Issues and Solutions

### Build Issues

```bash
# Clear cache and reinstall
rm -rf node_modules
pnpm install

# Regenerate Prisma client
cd apps/backend
npx prisma generate
```

### Database Issues

```bash
# Reset database
cd apps/backend
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

### Mobile Build Issues

```bash
# Clear Expo cache
cd apps/mobile
npx expo start --clear

# Reset Metro cache
npx expo start --reset-cache
```

## 🤝 Community Guidelines

### Communication

- **Be respectful** and inclusive
- **Ask questions** when unsure
- **Provide constructive feedback**
- **Help other contributors**

### Code of Conduct

- **Respect all contributors**
- **No harassment or discrimination**
- **Professional behavior** expected
- **Report violations** to maintainers

## 📞 Getting Help

### Resources

- **GitHub Issues** - For bug reports and feature requests
- **GitHub Discussions** - For questions and general discussion
- **Documentation** - Check README.md and inline docs
- **Code examples** - Look at existing implementations

### Contact

- **Open an issue** for bugs or feature requests
- **Start a discussion** for questions
- **Email maintainers** for sensitive issues

## 🙏 Recognition

Contributors will be recognized in:

- **CHANGELOG.md** for significant contributions
- **GitHub contributors** page
- **Release notes** for major releases

Thank you for contributing to the IoT Vending Machine project! 🚀
