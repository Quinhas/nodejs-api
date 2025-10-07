import type { IApp } from '../app.ts';
import { healthCheckRoute } from './app/health/health.check.route.ts';

export async function routes(app: IApp) {
  app.register(
    (router) => {
      router.register(healthCheckRoute);
    },
    { prefix: '/v1' }
  );
}
