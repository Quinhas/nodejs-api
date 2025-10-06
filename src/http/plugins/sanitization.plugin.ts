import fastifyPlugin from 'fastify-plugin';
import { env } from '../../env.ts';
import { sanitizeObject } from '../../shared/helpers/sanitization.helper.ts';
import type { IApp } from '../app.ts';

async function sanitizationPlugin(app: IApp) {
  if (!env.SANITIZE_ENABLED) {
    return;
  }

  app.addHook('preValidation', async (request) => {
    if (request.body && typeof request.body === 'object') {
      request.body = sanitizeObject(request.body as Record<string, unknown>);
    }

    if (request.query && typeof request.query === 'object') {
      request.query = sanitizeObject(request.query as Record<string, unknown>);
    }

    if (request.params && typeof request.params === 'object') {
      request.params = sanitizeObject(
        request.params as Record<string, unknown>
      );
    }
  });
}

export default fastifyPlugin(sanitizationPlugin, {
  name: 'sanitization',
});
