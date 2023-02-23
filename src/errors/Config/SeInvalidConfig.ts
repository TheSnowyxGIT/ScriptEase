import * as chalk from 'chalk';
import SE_ERROR from '../SeError';

export default class SE_InvalidConfigError extends SE_ERROR {
  public name = 'SE_InvalidConfigError';
  private _message: string;

  constructor(msg: string) {
    super();
    this._message = msg;
  }

  toString() {
    return chalk.gray(this._message);
  }
}
