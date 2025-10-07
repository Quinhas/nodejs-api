import type { IUseCase } from '../../../../../../@types/app.ts';
import type { INodeEnv } from '../../../../../../env.ts';
import type { IServiceStatus } from '../../@types/health.ts';

export type IHealthCheckUseCaseInput = void;
export interface IHealthCheckUseCaseOutput {
  status: 'ok' | 'degraded';
  name: string;
  version: string;
  environment: INodeEnv;
  timezone: string;
  timestamp: string;
  uptime: number;
  services?: Record<string, IServiceStatus>;
}

export type IHealthCheckUseCase = IUseCase<
  IHealthCheckUseCaseInput,
  IHealthCheckUseCaseOutput
>;
