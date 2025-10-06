FROM node:22.20.0-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM base AS build

COPY package.json pnpm-lock.yaml tsconfig.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
RUN pnpm run typecheck

FROM base AS prod

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile --ignore-scripts

COPY --from=build /app/src ./src
COPY --from=build /app/tsconfig.json ./

USER nodejs

CMD ["pnpm", "start"]
