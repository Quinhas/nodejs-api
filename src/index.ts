import { closeDatabase, validateConnection } from './db/client.ts';
import { env } from './env.ts';
import { app, logger } from './http/app.ts';
import { bootstrap } from './http/bootstrap.ts';

if (env.NODE_ENV === 'production') {
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
}

try {
  await validateConnection();
  await bootstrap();
} catch (error) {
  logger.error({ error }, 'Failed to start application');
  await closeDatabase();
  process.exit(1);
}
