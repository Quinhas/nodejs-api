import type { Logger } from 'pino';
import type {
  IGetServiceStatusService,
  IServiceStatus,
} from '../../core/types/services/get-service-status.service.ts';
import type { IDB } from '../../database/client.ts';

export class GetDbStatusService implements IGetServiceStatusService {
  private db: IDB;
  private logger: Logger;

  constructor(props: { db: IDB; logger: Logger }) {
    this.db = props.db;
    this.logger = props.logger;
  }

  async execute(): Promise<IServiceStatus> {
    try {
      const result = await this.db.execute('SELECT 1 AS result');

      if (!result || !Array.isArray(result.rows) || result.rows.length !== 1) {
        throw new Error('Database did not return expected result');
      }

      return 'ok';
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error : { message: 'Unknown error', error }
      );
      return 'error';
    }
  }
}
