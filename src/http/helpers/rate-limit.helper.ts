import type { RateLimitPluginOptions } from '@fastify/rate-limit';

export function createRateLimitConfig(
  max: number,
  timeWindow: string
): RateLimitPluginOptions {
  return {
    max,
    timeWindow,
  };
}

export const rateLimitPresets = {
  auth: createRateLimitConfig(5, '15 minutes'),
  strict: createRateLimitConfig(10, '1 minute'),
  moderate: createRateLimitConfig(30, '1 minute'),
  relaxed: createRateLimitConfig(100, '1 minute'),
};
