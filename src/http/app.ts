import fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { env } from '../env.ts';
import { errorHandler } from './error-handler.ts';
import { notFoundHandler } from './not-found-error-handler.ts';

const app = fastify({
  logger:
    env.NODE_ENV === 'development' ?
      {
        transport: {
          level: 'debug',
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

export const logger = app.log;

type IApp = typeof app;
export { app, type IApp };
