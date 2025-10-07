import pino from 'pino';
import { env } from '../env.ts';

export const logger = pino(
  env.NODE_ENV === 'development' ?
    {
      level: 'trace',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss',
          ignore: 'pid,hostname',
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
          responseTime: res.responseTime,
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
    }
);
