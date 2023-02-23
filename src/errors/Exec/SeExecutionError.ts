import * as chalk from 'chalk';
import SE_ERROR from '../SeError';

export default abstract class SE_ExecutionError extends SE_ERROR {
  public name = 'SE_ExecutionError';
  protected abstract error: any;

  public static error2String(error: any): string {
    let text = '';
    if (error instanceof Error) {
      text += chalk.gray(error.stack);
    } else if (error instanceof SE_ERROR) {
      text += `\t${chalk.gray(`${error.name}: `)}${error.toString()}`;
    }
    return text;
  }
}
