import * as chalk from 'chalk';
import SE_ExecutionError from './SeExecutionError';

export default class SE_LeafExecutionError extends SE_ExecutionError {
  public name = 'SE_LeafExecutionError';
  private _identifier: string;
  protected error: any;

  constructor(identifier: string, error: any) {
    super();
    this._identifier = identifier;
    this.error = error;
  }

  public toString(): string {
    let text = chalk.gray("An error occured inside the execution of '");
    text += chalk.white(this._identifier) + chalk.gray("' : \n");
    text += SE_ExecutionError.error2String(this.error);
    return text;
  }
}
