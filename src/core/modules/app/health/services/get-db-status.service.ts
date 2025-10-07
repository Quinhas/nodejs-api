import type { ILogger } from '../../../../../@types/logger.ts';
import { type IDB } from '../../../../../db/client.ts';
import type { IGetStatusService, IServiceStatus } from '../@types/health.ts';

export class GetDbStatusService implements IGetStatusService {
  private db: IDB;
  private logger: ILogger;

  constructor(props: { db: IDB; logger: ILogger }) {
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
