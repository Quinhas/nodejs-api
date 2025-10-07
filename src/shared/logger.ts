import pino, { type LoggerOptions } from 'pino';
import { env, type INodeEnv } from '../env.ts';

const config: Record<INodeEnv, LoggerOptions> = {
  development: {
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
  },
  test: {
    level: 'warn',
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
        requestId: req.id,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
        responseTime: res.responseTime,
      }),
    },
  },
  production: {
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
};

export const logger = pino(config[env.NODE_ENV]);
