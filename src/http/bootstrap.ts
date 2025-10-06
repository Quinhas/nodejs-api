import fastifyAutoload from '@fastify/autoload';
import path from 'node:path';
import { env } from '../env.ts';
import { app, logger } from './app.ts';

export async function bootstrap() {
  await app.register(fastifyAutoload, {
    dir: path.join(import.meta.dirname, 'plugins'),
    dirNameRoutePrefix: false,
    forceESM: true,
  });

  const address = await app.listen({
    port: env.PORT,
    host: '0.0.0.0',
  });

  logger.info(`HTTP server running on ${address}`);
}
