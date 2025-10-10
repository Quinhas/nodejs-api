import { formatISO } from 'date-fns';
import { env, type INodeEnv } from '../../../../../env.ts';
import type {
  IGetServiceStatusService,
  IServiceStatus,
} from '../../../../types/services/get-service-status.service.ts';
import type { IUseCase } from '../../../../types/use-case.ts';

export type IHealthCheckUseCaseInput = void;
export interface IHealthCheckUseCaseOutput {
  status: 'ok' | 'degraded';
  name: string;
  version: string;
  environment: INodeEnv;
  timezone: string;
  timestamp: string;
  uptime: number;
  services: Record<string, IServiceStatus>;
}

export type IHealthCheckUseCase = IUseCase<
  IHealthCheckUseCaseInput,
  IHealthCheckUseCaseOutput
>;

export default class HealthCheckUseCase implements IHealthCheckUseCase {
  private services: Record<string, IGetServiceStatusService>;

  constructor({
    getDbStatusService,
  }: {
    getDbStatusService: IGetServiceStatusService;
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
      timestamp: formatISO(new Date()),
      uptime: process.uptime(),
      services: servicesStatus,
    };
  }
}
