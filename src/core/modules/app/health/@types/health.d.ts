export type IServiceStatus = 'ok' | 'error';

export interface IGetStatusService {
  execute(): Promise<IServiceStatus>;
}
