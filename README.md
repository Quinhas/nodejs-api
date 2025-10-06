# Node.js API

Simple Node.js + TypeScript application with Docker support.

## Prerequisites

- Docker & Docker Compose
- Node.js 22+ (for local development)
- pnpm 10.18.0+

## Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Start services:

```bash
docker-compose up
```

3. Access the application:

- App: http://localhost:3333
- Database: localhost:5432
- Drizzle Studio: https://local.drizzle.studio/
- Debug port: 9229

## Development

### Local (without Docker)

```bash
pnpm install
pnpm dev
```

### With Docker

```bash
docker-compose up
```

The app runs with hot-reload enabled.

### Debugging

Use VS Code's "Attach to API Container" debug configuration (F5).

### Code Quality

#### Linting & Formatting

```bash
# Run ESLint
pnpm lint

# Fix ESLint issues
pnpm lint:fix

# Format code with Prettier
pnpm format

# Check formatting
pnpm format:check

# Run both (CI)
pnpm ci:lint
```

#### Git Hooks

The project uses Husky to manage git hooks:

- **pre-commit**: Runs ESLint and Prettier on staged files via lint-staged
- **commit-msg**: Validates commit messages using commitlint

#### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:

```bash
git commit -m "feat: add user authentication"
git commit -m "fix(api): handle null response"
```

#### Drizzle Commands

**From your host machine** (requires containers running):

```bash
# Push schema changes to database
pnpm docker:db:push

# Generate migrations
pnpm docker:db:generate

# Run migrations
pnpm docker:db:migrate

# Open Drizzle Studio (database GUI)
pnpm docker:db:studio
```

#### Alternative: Inside Container

```bash
# Access the container
docker compose exec -it app sh

# Then run commands directly
pnpm db:push
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

Access Drizzle Studio at https://local.drizzle.studio/

## Production

Build and run:

```bash
docker build -t app --target prod .
docker run -p 3333:3333 --env-file .env app
```

## Stack

### Core
- Node.js 22.20.0
- TypeScript 5.9
- PostgreSQL 17
- Fastify
- Drizzle ORM

### Security & Validation
- Helmet (security headers)
- CORS (cross-origin resource sharing)
- Rate Limiting (DDoS protection)
- Input Sanitization (XSS prevention)
- Zod (schema validation)

### Development Tools
- Docker & Docker Compose
- ESLint + Prettier
- Husky + lint-staged + commitlint
- Drizzle Studio (database GUI)

### Dependency Injection
- Awilix (IoC container)
