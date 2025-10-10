import type { Auth } from 'better-auth';
import z from 'zod';
import { AppError } from '../../../shared/errors/app-error.ts';
import type { IApp } from '../../app.ts';

const bodySchema = z.object({
  code: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
});

export async function authHandler(app: IApp) {
  app.route({
    method: ['GET', 'POST'],
    url: '/auth/*',
    schema: {
      hide: true,
    },
    handler: async (request, reply) => {
      const url = new URL(request.url, `http://${request.headers.host}`);

      const headers = new Headers();
      Object.entries(request.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value.toString());
      });

      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        body: request.body ? JSON.stringify(request.body) : undefined,
      });

      const auth = app.diContainer.resolve<Auth>('auth');

      const response = await auth.handler(req);
      response.headers.forEach((value, key) => reply.header(key, value));

      if (response.ok || response.status >= 300 || response.status <= 399) {
        return reply
          .status(response.status)
          .send(response.body ? await response.text() : null);
      }

      const body = response.body ? await response.json() : null;

      const parsed = bodySchema.safeParse(body);
      const code = parsed.success ? (parsed.data.code ?? null) : null;
      const message = parsed.success ? (parsed.data.message ?? null) : null;

      if (code && message) {
        throw new AppError({
          code,
          message,
          statusCode: response.status,
        });
      }

      throw AppError.internal({
        message: 'Authentication error',
      });
    },
  });
}
