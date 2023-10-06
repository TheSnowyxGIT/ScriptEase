import { Logger, logger } from './Logger';
import * as chalk from 'chalk';

type Writer = { writer: (logLevel: number, data: any) => string; minLogLevel?: number };

export default class LoggerContext {
  private _logger: Logger;
  private _context: string;
  private _writers: Record<string, Writer>;

  constructor(logger: Logger, context: string) {
    this._logger = logger;
    this._writers = {};
    this._context = context;
  }

  public define(tag: string, writer: Writer) {
    this._writers[tag] = writer;
  }

  public send(tag: string, data: any) {
    if (this._writers[tag]) {
      const writer = this._writers[tag];
      if (writer.minLogLevel === undefined || this._logger.logLevel >= writer.minLogLevel) {
        const str = writer.writer(this._logger.logLevel, data);
        logger.info(`${chalk.gray(this._context)} - ` + str);
      }
    }
  }
}
