import { closeDatabase, validateConnection } from './db/client.ts';
import { app } from './http/app.ts';
import { bootstrap } from './http/bootstrap.ts';
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
  await bootstrap();
} catch (error) {
  logger.error({ error }, 'Failed to start application');
  if (connectionEstablished) {
    await closeDatabase();
  }
  process.exit(1);
}
