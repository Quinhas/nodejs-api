import { fastifyAwilixPlugin } from '@fastify/awilix';
import { asValue } from 'awilix';
import fastifyPlugin from 'fastify-plugin';
import type { IApp } from '../app.ts';

export async function awilixPlugin(app: IApp) {
  await app.register(fastifyAwilixPlugin, {
    disposeOnClose: true,
    disposeOnResponse: false,
    strictBooleanEnforced: true,
  });

  app.diContainer.register({
    logger: asValue(app.log),
  });
}

export default fastifyPlugin(awilixPlugin, {
  name: 'awilix',
});
