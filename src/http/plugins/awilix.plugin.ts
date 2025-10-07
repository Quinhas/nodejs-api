import { fastifyAwilixPlugin } from '@fastify/awilix';
import { asClass, asValue, Lifetime } from 'awilix';
import fastifyPlugin from 'fastify-plugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GetDbStatusService } from '../../core/modules/app/health/services/get-db-status.service.ts';
import { db } from '../../db/client.ts';
import { logger } from '../../shared/logger.ts';
import { type IApp } from '../app.ts';

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

export async function awilixPlugin(app: IApp) {
  await app.register(fastifyAwilixPlugin, {
    disposeOnClose: true,
    disposeOnResponse: false,
    strictBooleanEnforced: true,
  });

  app.diContainer.register({
    logger: asValue(logger),
    db: asValue(db),
    getDbStatusService: asClass(GetDbStatusService).singleton(),
  });

  const useCasesPath = path.join(
    _dirname,
    '..',
    '..',
    'core',
    'modules',
    '**',
    'use-cases',
    '*.use-case.ts'
  );

  app.diContainer.loadModules([useCasesPath], {
    formatName: 'camelCase',
    resolverOptions: {
      register: asClass,
      lifetime: Lifetime.SCOPED,
    },
  });

  logger.debug(
    {
      dependencies: Object.keys(app.diContainer.registrations),
    },
    'Deps registered in the DI container'
  );
}

export default fastifyPlugin(awilixPlugin, {
  name: 'awilix',
});
