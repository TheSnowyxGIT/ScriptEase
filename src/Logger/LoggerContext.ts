import { Logger } from './Looger';

type Writer = { writer: (logLevel: number, data: any) => void; minLogLevel?: number };

export default class LoggerContext {
  private _logger: Logger;
  private _writers: Record<string, Writer>;

  constructor(logger: Logger) {
    this._logger = logger;
    this._writers = {};
  }

  public define(tag: string, writer: Writer) {
    this._writers[tag] = writer;
  }

  public send(tag: string, data: any) {
    if (this._writers[tag]) {
      const writer = this._writers[tag];
      if (writer.minLogLevel === undefined || this._logger.logLevel >= writer.minLogLevel) {
        writer.writer(this._logger.logLevel, data);
      }
    }
  }
}
