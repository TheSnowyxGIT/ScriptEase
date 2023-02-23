import * as chalk from 'chalk';
import SE_ERROR from '../SeError';

export default class SE_BuildError extends SE_ERROR {
  public name = 'SE_BuildError';
  private _message: string;

  constructor(msg: string) {
    super();
    this._message = msg;
  }

  public toString(): string {
    return chalk.gray(this._message);
  }
}
