import { closeDatabase, validateConnection } from './db/client.ts';
import { env } from './env.ts';
import { app } from './http/app.ts';
import { logger } from './shared/logger.ts';

async function gracefulShutdown() {
  try {
    logger.info('Shutting down...');
    await app.close();

    logger.info('Closing database connection...');
    await closeDatabase();

    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Error during shutdown');
    process.exit(1);
  }
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

let connectionEstablished = false;

try {
  await validateConnection();
  connectionEstablished = true;
  const address = await app.listen({
    port: env.PORT,
    host: '0.0.0.0',
  });

  logger.info(`HTTP server running on ${address}`);
} catch (error) {
  logger.error({ error }, 'Failed to start application');
  if (connectionEstablished) {
    await closeDatabase();
  }
  process.exit(1);
}
