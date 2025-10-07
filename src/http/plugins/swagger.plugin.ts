import fastifySwagger from '@fastify/swagger';
import scalarFastifyApiReference from '@scalar/fastify-api-reference';
import fp from 'fastify-plugin';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';
import { env } from '../../env.ts';
import type { IApp } from '../app.ts';

async function swaggerPlugin(app: IApp) {
  if (env.NODE_ENV !== 'development') {
    return;
  }

  await app.register(fastifySwagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: env.npm_package_name,
        description: env.npm_package_description,
        version: env.npm_package_version,
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: 'development',
        },
      ],
    },
    transform: jsonSchemaTransform,
  });

  await app.register(scalarFastifyApiReference, {
    routePrefix: '/docs',
    configuration: {
      theme: 'deepSpace',
      metaData: {
        title: env.npm_package_name,
        ogTitle: env.npm_package_name,
        description: env.npm_package_description,
        ogDescription: env.npm_package_description,
      },
      defaultHttpClient: {
        targetKey: 'http',
        clientKey: 'HTTP/1.1',
      },
      persistAuth: true,
      showOperationId: true,
      searchHotKey: 'p',
    },
  });

  app.log.debug(`Swagger UI available at http://localhost:${env.PORT}/docs`);
}

export default fp(swaggerPlugin, {
  name: 'swagger-plugin',
});
