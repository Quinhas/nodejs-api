# Node.js Microservices

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
- App: http://localhost:3000
- Database: localhost:5432
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

## Production

Build and run:
```bash
docker build -t app --target prod .
docker run -p 3000:3000 --env-file .env app
```

## Stack

- Node.js 22.20.0
- TypeScript 5.9
- PostgreSQL 17
- Docker & Docker Compose
