import { logger } from '../shared/logger.ts';

async function seed() {
  logger.info('Running seed script...');

  logger.info('Seed script completed.');
  process.exit(0);
}

seed();
