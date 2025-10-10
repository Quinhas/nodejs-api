import fastifySwagger from '@fastify/swagger';
import scalarFastifyApiReference from '@scalar/fastify-api-reference';
import fp from 'fastify-plugin';
import {
  jsonSchemaTransform,
  jsonSchemaTransformObject,
} from 'fastify-type-provider-zod';
import { env } from '../../env.ts';
import type { IApp } from '../app.ts';
import {
  badRequestErrorSchema,
  forbiddenErrorSchema,
  internalServerErrorSchema,
  unauthorizedErrorSchema,
} from '../schemas/error-responses.schema.ts';

async function swaggerPlugin(app: IApp) {
  if (env.NODE_ENV !== 'development') {
    return;
  }

  app.addHook('onRoute', (routeOptions) => {
    if (!routeOptions.schema?.response) {
      return;
    }

    const config = routeOptions.config as { auth?: unknown } | undefined;
    const hasAuth = config?.auth !== undefined;

    const response = routeOptions.schema.response as Record<number, unknown>;

    if (!response[400]) {
      response[400] = badRequestErrorSchema;
    }

    if (!response[500]) {
      response[500] = internalServerErrorSchema;
    }

    if (hasAuth) {
      if (!response[401]) {
        response[401] = unauthorizedErrorSchema;
      }

      if (!response[403]) {
        response[403] = forbiddenErrorSchema;
      }
    }
  });

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
    transformObject: jsonSchemaTransformObject,
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
      sources: [
        { url: '/auth/open-api/generate-schema', title: 'Auth' },
        { url: '/docs/openapi.json', title: 'API' },
      ],
    },
  });

  app.log.debug(`Swagger UI available at http://localhost:${env.PORT}/docs`);
}

export default fp(swaggerPlugin, {
  name: 'swagger-plugin',
});
