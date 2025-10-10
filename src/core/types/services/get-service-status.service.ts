export type IServiceStatus = 'ok' | 'error';

export interface IGetServiceStatusService {
  execute(): Promise<IServiceStatus>;
}
