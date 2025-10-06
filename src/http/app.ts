import fastifyAutoload from '@fastify/autoload';
import fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import path from 'node:path';
import { env } from '../env.ts';
import { errorHandler } from './error-handler.ts';
import { notFoundHandler } from './not-found-error-handler.ts';

const app = fastify({
  logger:
    env.NODE_ENV === 'development' ?
      {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname',
            singleLine: true,
            timezone: env.TZ,
          },
        },
        serializers: {
          req: (req) => ({
            method: req.method,
            url: req.url,
            headers: req.headers,
            requestId: req.id,
          }),
          res: (res) => ({
            statusCode: res.statusCode,
            headers: res.headers,
          }),
        },
      }
    : {
        level: 'info',
        serializers: {
          req: (req) => ({
            method: req.method,
            url: req.url,
            requestId: req.id,
            userAgent: req.headers['user-agent'],
            ip: req.ip,
          }),
          res: (res) => ({
            statusCode: res.statusCode,
          }),
        },
      },
}).withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.setErrorHandler(errorHandler);
app.setNotFoundHandler(notFoundHandler);

await app.register(fastifyAutoload, {
  dir: path.join(import.meta.dirname, 'plugins'),
  dirNameRoutePrefix: false,
  forceESM: true,
});

async function startHttpServer() {
  const address = await app.listen({ port: env.PORT, host: '0.0.0.0' });
  app.log.info(`HTTP server running on ${address}`);
}

type IApp = typeof app;
export { app, startHttpServer, type IApp };
