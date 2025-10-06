import { closeDatabase } from './db/client.ts';
import { env } from './env.ts';
import { app, startHttpServer } from './http/app.ts';

if (env.NODE_ENV === 'production') {
  async function gracefulShutdown() {
    try {
      app.log.info('Shutting down...');
      await app.close();

      app.log.info('Closing database connection...');
      await closeDatabase();

      app.log.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      app.log.error({ error }, 'Error during shutdown');
      process.exit(1);
    }
  }

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

await startHttpServer();
