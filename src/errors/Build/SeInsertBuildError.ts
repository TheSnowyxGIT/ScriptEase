import * as chalk from 'chalk';
import SE_BuildError from './SeBuildError';

export default class SE_InsertBuildError extends SE_BuildError {
  public name = 'SE_InsertBuildError';
  private _insertType: string;
  private _parentType: string | undefined;

  constructor(insertType: string, parentType?: string) {
    super('');
    this._insertType = insertType;
    this._parentType = parentType;
  }

  public toString(): string {
    let text = '';
    if (this._parentType) {
      text = chalk.gray(
        `Cannot insert a '${chalk.white(this._insertType)}' into a '${chalk.white(this._parentType)}'.`,
      );
    } else {
      text = chalk.gray(`Cannot insert a '${chalk.white(this._insertType)}'.`);
    }
    return text;
  }
}
