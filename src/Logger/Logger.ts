import * as chalk from 'chalk';

export class Logger {
  static LOG_LEVEL_RANGE: [number, number] = [0, 2];
  static PREFIX = '[SE] ';

  private _activate = true;
  private _logLevel = 1;

  constructor() {
    this._activate = process.env.NODE_ENV !== 'test';
  }

  public set logLevel(value: number) {
    value = Math.max(value, Logger.LOG_LEVEL_RANGE[0]);
    value = Math.min(value, Logger.LOG_LEVEL_RANGE[1]);
    this._logLevel = value;
  }

  public get logLevel() {
    return this._logLevel;
  }

  public get prefix() {
    return chalk.blue(Logger.PREFIX);
  }

  public info(message: string) {
    if (!this._activate || this.logLevel < 1) {
      return;
    }
    console.log(this.prefix + message);
  }

  public warn(message: string) {
    if (!this._activate) {
      return;
    }
    console.warn(this.prefix + chalk.magenta('WARNING: ') + message);
  }

  public error(message: string) {
    if (!this._activate) {
      return;
    }
    console.error(this.prefix + chalk.red('ERROR: ') + message);
  }
}

export const logger = new Logger();
logger.logLevel = 2;
