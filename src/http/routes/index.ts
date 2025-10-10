import type { IApp } from '../app.ts';
import { healthCheckRoute } from './app/health/health-check.route.ts';
import { authHandler } from './auth/auth.route.ts';

export async function routes(app: IApp) {
  app.register(authHandler);

  app.register(
    (router) => {
      router.register(healthCheckRoute);
    },
    { prefix: '/v1' }
  );
}
