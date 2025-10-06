import rateLimit from '@fastify/rate-limit';
import fastifyPlugin from 'fastify-plugin';
import { env } from '../../env.ts';
import type { IApp } from '../app.ts';

async function rateLimitPlugin(app: IApp) {
  await app.register(rateLimit, {
    global: true,
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_TIME_WINDOW,
    ...(env.RATE_LIMIT_BAN && { ban: env.RATE_LIMIT_BAN }),
    cache: 10000,
    continueExceeding: true,
    skipOnError: false,
    errorResponseBuilder: (_request, context) => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded, retry in ${Math.round(context.ttl / 1000)} seconds`,
    }),
    enableDraftSpec: true,
    addHeadersOnExceeding: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
    },
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true,
      'retry-after': true,
    },
  });
}

export default fastifyPlugin(rateLimitPlugin, {
  name: 'rate-limit',
});
