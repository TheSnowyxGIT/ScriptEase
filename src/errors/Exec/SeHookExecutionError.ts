import * as chalk from 'chalk';
import SE_ExecutionError from './SeExecutionError';

export default class SE_HookExecutionError extends SE_ExecutionError {
  public name: string = 'SE_HookExecutionError';
  protected error: any;

  constructor(error: any) {
    super();
    this.error = error;
  }

  public toString(): string {
    let text = chalk.gray('An error occured inside the execution of a hook : \n');
    text += SE_ExecutionError.error2String(this.error);
    return text;
  }
}
