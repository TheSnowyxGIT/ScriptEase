import * as chalk from 'chalk';
import SE_ERROR from './SeError';

export default class SE_InvalidArgsError extends SE_ERROR {
  public name = 'SE_InvalidArgsError';
  private _message: string;

  public get message() {
    return this._message;
  }

  constructor(msg: string) {
    super();
    this._message = msg;
  }

  toString() {
    return chalk.gray(this._message);
  }
}
