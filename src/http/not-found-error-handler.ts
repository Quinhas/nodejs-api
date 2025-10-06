import type { FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../env.ts';
import { AppError } from '../shared/errors/app-error.ts';

export async function notFoundHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (env.NODE_ENV !== 'production') {
    request.log.warn({
      message: `Route ${request.method}:${request.url} not found`,
      url: request.url,
      method: request.method,
      params: request.params,
      query: request.query,
    });
  }
  const appError = AppError.notFound();
  return reply.status(appError.statusCode).send(appError.toJSON());
}
