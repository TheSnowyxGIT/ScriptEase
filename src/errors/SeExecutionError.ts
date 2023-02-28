import * as chalk from 'chalk';
import Result from '../Result/Result';
import SE_ERROR from './SeError';

export default class SE_ExecutionError extends SE_ERROR {
  public name = 'SE_ExecutionError';
  private _identifier: string;
  private _result: Result;

  constructor(identifier: string, result: Result) {
    super();
    this._identifier = identifier;
    this._result = result.getRootParent();
  }

  toString() {
    let text = chalk.gray(`The execution of the '${chalk.white(this._identifier)}' script failed.`);
    text += '\n';
    text += this._result.toString({ indent: 1 });
    return text;
  }
}
