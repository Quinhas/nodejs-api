import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';
import { env } from '../env.ts';
import { AppError } from '../shared/errors/app-error.ts';

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send(error.toJSON());
  }

  if (hasZodFastifySchemaValidationErrors(error)) {
    const appError = AppError.badRequest({
      details: {
        context: {
          issues: error.validation.map((issue) => ({
            message: issue.message,
            field: issue.path,
          })),
        },
      },
    });

    return reply.status(appError.statusCode).send(appError.toJSON());
  }

  if (error.statusCode === 429) {
    const appError = AppError.tooManyRequests();
    return reply.status(appError.statusCode).send(appError.toJSON());
  }

  if (env.NODE_ENV !== 'production') {
    request.log.error(
      {
        err: error,
        errorType: error.constructor.name,
        request: {
          id: request.id,
          method: request.method,
          url: request.url,
          params: request.params,
          query: request.query,
          userAgent: request.headers['user-agent'],
          ip: request.ip,
        },
        stack: error.stack,
      },
      'Unhandled error'
    );
  } else {
    // TODO: send to external service (Sentry, Datadog, etc.)
  }

  const appError = AppError.internal({
    previous: error,
    details:
      env.NODE_ENV !== 'production' ?
        { context: { message: error.message, name: error.name } }
      : undefined,
  });

  return reply.status(appError.statusCode).send(appError.toJSON());
}
