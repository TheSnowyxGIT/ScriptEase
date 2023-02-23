import * as chalk from 'chalk';
import SE_BuildError from './SeBuildError';

export default class SE_DuplicateHookBuildError extends SE_BuildError {
  public name = 'SE_DuplicateHookBuildError';
  private _hookType: string;

  constructor(hookType: string) {
    super('');
    this._hookType = hookType;
  }

  public toString(): string {
    let text = '';
    text = chalk.gray(
      `Cannot insert a '${chalk.white(this._hookType)}'. There is already a '${chalk.white(
        this._hookType,
      )}' in this context.'`,
    );
    return text;
  }
}
