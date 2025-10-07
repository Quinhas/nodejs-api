import fastifyAutoload from '@fastify/autoload';
import path from 'node:path';
import { env } from '../env.ts';
import { logger } from '../shared/logger.ts';
import { app } from './app.ts';
import { routes } from './routes/index.ts';

export async function bootstrap() {
  await app.register(fastifyAutoload, {
    dir: path.join(import.meta.dirname, 'plugins'),
    dirNameRoutePrefix: false,
    forceESM: true,
  });

  await app.register(routes);

  const address = await app.listen({
    port: env.PORT,
    host: '0.0.0.0',
  });

  logger.info(`HTTP server running on ${address}`);
}
