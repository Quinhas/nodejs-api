import z from 'zod';
import type HealthCheckUseCase from '../../../../core/modules/app/health/use-cases/health-check.use-case.ts';
import { nodeEnvSchema } from '../../../../env.ts';
import type { IApp } from '../../../app.ts';

const serviceStatusSchema = z.enum(['ok', 'error']);

const healthCheckRouteResponseSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  name: z.string(),
  version: z.string(),
  environment: nodeEnvSchema,
  timezone: z.string(),
  timestamp: z.string(),
  uptime: z.number(),
  services: z.record(z.string(), serviceStatusSchema),
});

export async function healthCheckRoute(app: IApp) {
  app.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        summary: 'Health Check',
        description:
          'Check the health status of the application and its dependencies.',
        operationId: 'healthCheck',
        response: {
          200: healthCheckRouteResponseSchema.extend({
            status: z.literal('ok'),
          }),
          503: healthCheckRouteResponseSchema.extend({
            status: z.literal('degraded'),
          }),
        },
      },
    },
    async (request, reply) => {
      const useCase =
        request.diScope.resolve<HealthCheckUseCase>('healthCheckUseCase');

      const result = await useCase.execute();

      const statusCode = result.status === 'ok' ? 200 : 503;

      return reply.status(statusCode).send(result);
    }
  );
}
