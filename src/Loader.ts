import Builder from './Builder';
import LoggerContext from './Logger/LoggerContext';
import { logger } from './Logger/Looger';
import SE_SENTINEL from './Tree/Sentinel';

type Infos = { files: string[] };

export default class Loader {
  private infos: Infos;
  private builder: Builder;
  private loggerContext: LoggerContext;

  constructor(infos: Infos, builder: Builder) {
    this.infos = infos;
    this.builder = builder;
    this.loggerContext = new LoggerContext(logger);
    this.loggerContext.define('start', {
      minLogLevel: 2,
      writer: (logLevel, data: { filesCount: number }) => {
        logger.info(`[Loader] ${data.filesCount} files to load.`);
      },
    });
    this.loggerContext.define('load', {
      minLogLevel: 2,
      writer: (logLevel, data: { filePath: number }) => {
        logger.info(`[Loader] \t'${data.filePath}' loaded.`);
      },
    });
    this.loggerContext.define('end', {
      writer: (logLevel, data: { filesCount: number }) => {
        logger.info(`[Loader] ${data.filesCount} files loaded.`);
      },
    });
  }

  public async load() {
    if (this.infos.files.length === 0) {
      logger.warn('[Loader] No file(s) to load.');
      return;
    }
    this.loggerContext.send('start', { filesCount: this.infos.files.length });
    for (const file of this.infos.files) {
      await this.loadFile(file);
      this.loggerContext.send('load', { filePath: file });
    }
    // after check
    this.builder.checkBuild();
    this.loggerContext.send('end', { filesCount: this.infos.files.length });
  }

  private async loadFile(file: string) {
    const sentinel = new SE_SENTINEL(file);
    this.builder.insert(sentinel);
    this.builder.moveHeadTo(sentinel);
    require(file);
    this.builder.moveHeadBack();
  }
}
