import { env } from '../../../../../env.ts';
import type { IGetStatusService } from '../@types/health.ts';
import type {
  IHealthCheckUseCase,
  IHealthCheckUseCaseOutput,
} from './@types/health-check.use-case.js';

export default class HealthCheckUseCase implements IHealthCheckUseCase {
  private services: Record<string, IGetStatusService>;

  constructor({
    getDbStatusService,
  }: {
    getDbStatusService: IGetStatusService;
  }) {
    this.services = {
      db: getDbStatusService,
    };
  }

  async execute(): Promise<IHealthCheckUseCaseOutput> {
    const serviceEntries = Object.entries(this.services);

    const results = await Promise.all(
      serviceEntries.map(async ([name, service]) => {
        const status = await service.execute();
        return [name, status] as const;
      })
    );

    const servicesStatus = Object.fromEntries(results);
    const allStatuses = Object.values(servicesStatus);

    const overallStatus =
      allStatuses.every((status) => status === 'ok') ? 'ok' : 'degraded';

    return {
      status: overallStatus,
      name: env.npm_package_name || 'unknown',
      version: env.npm_package_version || '0.0.0',
      environment: env.NODE_ENV,
      timezone: env.TZ,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: servicesStatus,
    };
  }
}
