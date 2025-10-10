# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Docker (Makefile)
```bash
make help             # Show all available commands
make up               # Start all services in detached mode
make up-attach        # Start all services in attached mode
make down             # Stop all services
make restart          # Restart all services
make logs             # Show logs from all services
make shell            # Open shell in app container
make rebuild          # Rebuild and restart all services
make clean            # Remove all containers, volumes, and images
make fix-permissions  # Fix file permissions (run if you get EACCES errors)
```

### Testing
```bash
make test          # Run tests with coverage (Docker)
make test-watch    # Run tests in watch mode (Docker)
pnpm test          # Run tests (inside container)
pnpm test:watch    # Run tests in watch mode (inside container)
```

### Database
```bash
make db-migrate    # Run migrations (Docker)
make db-push       # Push schema changes (Docker)
make db-generate   # Generate migrations (Docker)
make db-studio     # Open Drizzle Studio at https://local.drizzle.studio/ (Docker)
make db-seed       # Run database seed script (Docker)
pnpm db:migrate    # Run migrations (inside container)
pnpm db:push       # Push schema changes (inside container)
pnpm db:generate   # Generate migrations (inside container)
pnpm db:studio     # Open Drizzle Studio (inside container)
pnpm db:seed       # Run database seed script (inside container)
```

### Development
```bash
pnpm dev           # Start dev server with hot-reload and debugger
pnpm start         # Start production server
pnpm typecheck     # Run TypeScript type checking
pnpm lint          # Run ESLint
pnpm lint:fix      # Fix ESLint issues
pnpm format        # Format code with Prettier
pnpm format:check  # Check formatting
pnpm ci:lint       # Run both ESLint and Prettier checks (CI)
```

## Architecture Overview

This is a **Clean Architecture** Node.js API built with **Fastify**, **Drizzle ORM**, and **Awilix** for dependency injection.

### Core Layers

```
src/
├── core/modules/          # Business logic (use cases & services)
│   └── {domain}/
│       ├── use-cases/     # Application use cases
│       ├── services/      # Domain services
│       └── @types/        # Domain type definitions
├── http/                  # HTTP layer (routes, plugins, handlers)
│   ├── routes/           # Route definitions
│   ├── plugins/          # Fastify plugins (auto-loaded)
│   └── error-handler.ts  # Global error handling
├── database/             # Database layer
│   ├── schema/          # Drizzle schema definitions
│   └── client.ts        # Database client & connection
├── lib/                 # External library configurations
│   └── auth.ts          # Better Auth configuration
└── shared/              # Shared utilities, services & templates
    ├── services/        # Shared services (email, password, etc)
    └── templates/       # Email templates
```

### Dependency Injection with Awilix

The DI container is configured in `src/http/plugins/awilix.plugin.ts` and:
- Auto-loads **all use cases** matching `core/modules/**/use-cases/*.use-case.ts`
- Registers use cases as **scoped** (new instance per request)
- Registers services as **singleton** or **scoped** (manually configured)
- Makes dependencies available via `request.diScope.resolve<T>('dependencyName')`

Example:
```typescript
// In route handler
const useCase = request.diScope.resolve<HealthCheckUseCase>('healthCheckUseCase');
const result = await useCase.execute();
```

### Use Case Pattern

Use cases follow a strict interface pattern:
- Interface name: `I{UseCaseName}UseCase{Input|Output}`
- All use cases implement `IUseCase<TInput, TOutput>` from `@types/app.d.ts`
- Use cases receive dependencies via constructor injection
- Use cases expose a single `execute(input: TInput): Promise<TOutput>` method

Example:
```typescript
// @types/health-check.use-case.d.ts
export type IHealthCheckUseCaseInput = void;
export interface IHealthCheckUseCaseOutput { /* ... */ }
export type IHealthCheckUseCase = IUseCase<
  IHealthCheckUseCaseInput,
  IHealthCheckUseCaseOutput
>;

// health-check.use-case.ts
export default class HealthCheckUseCase implements IHealthCheckUseCase {
  constructor({ getDbStatusService }: { getDbStatusService: IGetStatusService }) {
    // Dependencies injected by Awilix
  }

  async execute(): Promise<IHealthCheckUseCaseOutput> {
    // Implementation
  }
}
```

### Fastify Plugins

Plugins are auto-loaded from `src/http/plugins/` during bootstrap:
- **awilix.plugin.ts**: Dependency injection container
- **swagger.plugin.ts**: OpenAPI documentation with Scalar UI
- **cors.plugin.ts**: CORS configuration
- **helmet.plugin.ts**: Security headers
- **rate-limit.plugin.ts**: DDoS protection
- **sanitization.plugin.ts**: XSS prevention (sanitizes request bodies)

### Route Organization

Routes are organized by domain under `src/http/routes/`:
- All routes are prefixed with `/v1` (configured in `routes/index.ts`)
- Routes use Zod schemas for validation and OpenAPI documentation
- Route files follow pattern: `{domain}/{feature}.route.ts`

Example:
```typescript
export async function healthCheckRoute(app: IApp) {
  app.get('/health', {
    schema: {
      tags: ['Health'],
      response: { 200: responseSchema }
    }
  }, async (request, reply) => {
    const useCase = request.diScope.resolve<HealthCheckUseCase>('healthCheckUseCase');
    const result = await useCase.execute();
    return reply.status(200).send(result);
  });
}
```

### Authentication with Better Auth

The API uses **Better Auth** for authentication, configured in `src/lib/auth.ts`:

**Architecture**:
- **Better Auth**: Modern authentication library with built-in session management
- **Drizzle Adapter**: Integrates Better Auth with the existing Drizzle ORM setup
- **Password Hashing**: Custom Argon2 implementation via `PasswordHashService`
- **ID Generation**: UUIDv7-based IDs for all auth-related tables (users, sessions, accounts)

**Configuration**:
```typescript
// src/lib/auth.ts - Better Auth setup
export const auth = betterAuth({
  database: drizzleAdapter(db, { /* ... */ }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  // Custom password hashing with Argon2
  // Custom ID generation with UUIDv7
});
```

**Database Schema**:
- `users`: User accounts with email verification
- `sessions`: Active user sessions
- `accounts`: OAuth provider accounts (for future extension)
- `verifications`: Email verification tokens

**Integration with DI Container**:
- `auth` instance registered as singleton in Awilix (`src/http/plugins/awilix.plugin.ts:26`)
- `passwordHashService` registered as singleton for consistent hashing
- Use cases can inject `auth` to perform authentication operations

**Example Use Case**:
```typescript
export default class SignUpUseCase {
  constructor({ auth }: { auth: Auth }) {
    this.auth = auth;
  }

  async execute(input: ISignUpUseCaseInput) {
    const result = await this.auth.api.signUpEmail({ /* ... */ });
    // Handle Better Auth errors and convert to AppError
  }
}
```

**Error Handling**:
- Better Auth throws `APIError` with specific error codes
- Use cases catch `APIError` and convert to `AppError` for consistent error responses
- Example: `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL` → `AppError.conflict()`

**Email Integration**:
- Email functionality handled by `AuthEmailService` in `src/shared/services/auth-email.service.ts`
- Unified service with three methods:
  - `sendVerificationEmail()`: Email verification link
  - `sendResetPasswordEmail()`: Password reset link
  - `sendPasswordResetConfirmation()`: Password change confirmation
- Email templates in `src/shared/templates/` use modern, accessible HTML design:
  - Minimalistic grayscale palette with subtle accent color
  - Semantic HTML with ARIA roles for accessibility
  - Mobile-responsive with proper spacing
  - Date formatting via `date-fns` (respects `TZ` from `.env`)
- Service registered as singleton in Awilix and injected into Better Auth callbacks

### Shared Services Architecture

The `src/shared/services/` directory contains cross-cutting services used across the application:

**Service Pattern**:
- Services are classes with clear interfaces and dependencies
- Registered as **singleton** in Awilix for consistent behavior
- Injectable into use cases and other services via constructor injection

**Available Services**:

1. **PasswordHashService** (`argon-password-hash.service.ts`):
   - Handles password hashing using Argon2id algorithm
   - Methods: `hash(password)`, `verify(password, hash)`
   - Integrated with Better Auth for secure password storage

2. **ResendEmailService** (`resend-email.service.ts`):
   - Email delivery via Resend API
   - Method: `send({ from, to, subject, html })`
   - Returns email ID for tracking

3. **AuthEmailService** (`auth-email.service.ts`):
   - Unified service for all authentication-related emails
   - Composes `ResendEmailService` for actual email delivery
   - Uses templates from `src/shared/templates/`
   - Methods:
     - `sendVerificationEmail({ to, name, verificationUrl })`
     - `sendResetPasswordEmail({ to, name, resetUrl })`
     - `sendPasswordResetConfirmation({ to, name })`

4. **GetDbStatusService** (`get-db-status.service.ts`):
   - Database health check service
   - Returns `'ok'` or `'error'` status
   - Used by health check endpoint

**Registration Example** (from `awilix.plugin.ts`):
```typescript
app.diContainer.register({
  auth: asValue(auth),
  getDbStatusService: asClass(GetDbStatusService).singleton(),
  // Services are instantiated once and reused
});
```

### Type-Safe API with Zod

The API uses `fastify-type-provider-zod` for:
- Runtime request/response validation
- Automatic TypeScript type inference
- OpenAPI schema generation from Zod schemas

All routes define Zod schemas that are used for both validation and documentation.

### Error Handling

Centralized error handling via `AppError` class:
- Extends native `Error` with structured error codes and status codes
- Provides factory methods: `badRequest()`, `unauthorized()`, `forbidden()`, `notFound()`, `conflict()`, `tooManyRequests()`, `internal()`
- Automatically serializes to JSON with appropriate HTTP status codes
- Stack traces are only included in non-production environments

Example:
```typescript
throw AppError.notFound({ message: 'User not found', details: { userId: id } });
throw AppError.conflict({ code: 'EMAIL_ALREADY_IN_USE', message: 'E-mail already in use.' });
```

### Database with Drizzle ORM

- Schema defined in `src/database/schema/**`
- Uses PostgreSQL with connection pooling (`pg` library)
- Column naming: **snake_case** (configured via `casing: 'snake_case'`)
- Migrations stored in `src/database/migrations/` with timestamp prefix
- Connection validation on startup with graceful shutdown handling

## Environment Variables

All environment variables are validated via Zod schema in `src/env.ts`:

**Required**:
- `DATABASE_URL`: PostgreSQL connection URL
- `DATABASE_USER`: Database username
- `DATABASE_PASSWORD`: Database password
- `DATABASE_HOST`: Database host
- `DATABASE_NAME`: Database name
- `BETTER_AUTH_SECRET`: Secret key for Better Auth (used for session encryption)

**Optional**:
- `NODE_ENV`: Environment (development/test/production) - default: `development`
- `TZ`: Timezone - default: `America/Sao_Paulo`
- `PORT`: Server port - default: `3333`
- `DATABASE_PORT`: Database port - default: `5432`
- `CORS_ORIGIN`: Comma-separated list of allowed origins
- `RATE_LIMIT_MAX`: Maximum requests per time window - default: `100`
- `RATE_LIMIT_TIME_WINDOW`: Time window for rate limiting - default: `1 minute`
- `RATE_LIMIT_BAN`: Ban duration in milliseconds (optional)
- `SANITIZE_ENABLED`: Enable XSS sanitization - default: `true`
- `RESEND_API_KEY`: Resend API key for sending emails (required for auth emails)
- `EMAIL_FROM`: Email address for sending emails (required for auth emails)

Copy `.env.example` to `.env` before starting development.

## Git Hooks

Husky manages git hooks:
- **pre-commit**: Runs ESLint and Prettier on staged files (lint-staged)
- **commit-msg**: Validates commit messages (commitlint with Conventional Commits)

Commit format: `<type>(<scope>): <description>`
Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## API Documentation

OpenAPI documentation is available at:
- Scalar UI: `http://localhost:3333/docs` (interactive API reference)
- JSON schema: `http://localhost:3333/docs/json`

Documentation is auto-generated from Zod schemas defined in route handlers.

## Debugging

VS Code debug configuration available for attaching to the Docker container on port 9229.

## Testing

### Running Tests

Tests run inside Docker container with access to the test database:

```bash
make test          # Run tests with coverage
make test-watch    # Run tests in watch mode
```

### Test Structure

Tests are **colocated** with the code they test:
- Routes: `src/http/routes/**/*.test.ts`
- Use cases: `src/core/modules/**/use-cases/*.test.ts`
- Services: `src/core/modules/**/services/*.test.ts`

### Testing Patterns

#### 1. Route Testing

Routes use **Supertest** to test HTTP endpoints:

```typescript
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { closeDatabase } from '../../../../database/client.ts';
import { app } from '../../../app.ts';

describe('Feature Route', () => {
  beforeAll(async () => {
    await app.ready(); // Initialize app without listening
  });

  afterAll(async () => {
    await app.close();      // Close Fastify app
    await closeDatabase();  // Close DB connections
  });

  test('should handle request', async () => {
    const response = await request(app.server).get('/v1/endpoint');
    expect(response.status).toEqual(200);
  });
});
```

**Key points**:
- Use `app.ready()` instead of `app.listen()` in tests
- Always close app and database in `afterAll` to prevent resource leaks
- Use `describe` blocks to group related tests

#### 2. Use Case Testing

Use cases should be tested in isolation with mocked dependencies:

```typescript
import { describe, expect, test, vi } from 'vitest';
import SomeUseCase from './some.use-case.ts';

describe('SomeUseCase', () => {
  test('should execute successfully', async () => {
    const mockService = {
      execute: vi.fn().mockResolvedValue('result'),
    };

    const useCase = new SomeUseCase({ service: mockService });
    const result = await useCase.execute({ input: 'data' });

    expect(result).toBeDefined();
    expect(mockService.execute).toHaveBeenCalledWith('data');
  });
});
```

#### 3. Test Environment

- **Environment**: Tests use `.env.test` (loaded via `test/setup.ts`)
- **Database**: Connects to `app_test` database on Docker's `db` service
- **Isolation**: Vitest runs in single-threaded mode to prevent DB connection conflicts
- **Coverage**: Enabled by default with v8 provider

### Test Lifecycle

1. **Setup** (`test/setup.ts`): Loads `.env.test` before any imports
2. **beforeAll**: Initialize app with `app.ready()`
3. **Tests**: Execute test cases
4. **afterAll**: Close app and database connections

### Best Practices

- ✅ Always close resources in `afterAll` hooks
- ✅ Use `describe` blocks to group related tests
- ✅ Test both success and error cases
- ✅ Validate response structure, not just status codes
- ✅ Mock external dependencies in use case tests
- ❌ Don't use `app.listen()` in tests (use `app.ready()`)
- ❌ Don't clear/truncate database (tests should handle existing data)
- ❌ Don't create factories for the app (singleton pattern is maintained)

## TypeScript Configuration

- **Module**: ESNext with `.ts` extension imports
- **Target**: ES2022
- **Strict mode**: Enabled
- **noEmit**: true (TypeScript used for type checking only, Node.js runs `.ts` files directly)
