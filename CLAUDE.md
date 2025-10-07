# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
```bash
pnpm dev              # Start dev server with hot-reload and debugger
pnpm start            # Start production server
pnpm typecheck        # Run TypeScript type checking
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm format           # Format code with Prettier
pnpm format:check     # Check formatting
pnpm ci:lint          # Run both ESLint and Prettier checks (CI)
```

### Database (Docker)
```bash
pnpm docker:db:push      # Push schema changes to database
pnpm docker:db:generate  # Generate migrations
pnpm docker:db:migrate   # Run migrations
pnpm docker:db:studio    # Open Drizzle Studio at https://local.drizzle.studio/
```

### Database (Local)
```bash
pnpm db:push      # Push schema changes
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Drizzle Studio
```

### Docker
```bash
docker compose up              # Start all services
docker compose exec app sh     # Access app container
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
├── db/                   # Database layer
│   ├── schema/          # Drizzle schema definitions
│   └── client.ts        # Database client & connection
└── shared/              # Shared utilities & helpers
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

### Type-Safe API with Zod

The API uses `fastify-type-provider-zod` for:
- Runtime request/response validation
- Automatic TypeScript type inference
- OpenAPI schema generation from Zod schemas

All routes define Zod schemas that are used for both validation and documentation.

### Error Handling

Centralized error handling via `AppError` class:
- Extends native `Error` with structured error codes and status codes
- Provides factory methods: `badRequest()`, `unauthorized()`, `forbidden()`, `notFound()`, `tooManyRequests()`, `internal()`
- Automatically serializes to JSON with appropriate HTTP status codes
- Stack traces are only included in non-production environments

Example:
```typescript
throw AppError.notFound({ message: 'User not found', details: { userId: id } });
```

### Database with Drizzle ORM

- Schema defined in `src/db/schema/**`
- Uses PostgreSQL with connection pooling (`pg` library)
- Column naming: **snake_case** (configured via `casing: 'snake_case'`)
- Migrations stored in `src/db/migrations/` with timestamp prefix
- Connection validation on startup with graceful shutdown handling

## Environment Variables

All environment variables are validated via Zod schema in `src/env.ts`:
- **Required**: `DATABASE_URL`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_HOST`, `DATABASE_NAME`
- **Optional**: `NODE_ENV` (default: development), `PORT` (default: 3333), `CORS_ORIGIN`, `RATE_LIMIT_*`, `SANITIZE_ENABLED`

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

## TypeScript Configuration

- **Module**: ESNext with `.ts` extension imports
- **Target**: ES2022
- **Strict mode**: Enabled
- **noEmit**: true (TypeScript used for type checking only, Node.js runs `.ts` files directly)
