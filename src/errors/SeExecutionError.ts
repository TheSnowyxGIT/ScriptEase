import * as chalk from 'chalk';
import SE_ERROR from './SeError';

export default class SE_ExecutionError extends SE_ERROR {
  public name = 'SE_ExecutionError';
  private _identifier;

  constructor(identifier: string) {
    super();
    this._identifier = identifier;
  }

  toString() {
    return chalk.gray(`The execution of the '${chalk.white(this._identifier)}' script failed.`);
  }
}
