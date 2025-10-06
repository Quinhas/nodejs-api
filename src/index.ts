import { closeDatabase, validateConnection } from './db/client.ts';
import { env } from './env.ts';
import { app, logger, startHttpServer } from './http/app.ts';

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
  await startHttpServer();
} catch (error) {
  logger.error({ error }, 'Failed to start application');
  process.exit(1);
}
