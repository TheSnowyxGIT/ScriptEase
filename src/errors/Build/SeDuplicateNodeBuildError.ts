import * as chalk from 'chalk';
import SE_BuildError from './SeBuildError';

export default class SE_DuplicateNodeBuildError extends SE_BuildError {
  public name = 'SE_DuplicateNodeBuildError';
  private _insertType: string;
  private _id: string;

  constructor(insertType: string, id: string) {
    super('');
    this._insertType = insertType;
    this._id = id;
  }

  public toString(): string {
    let text = '';
    text = chalk.gray(
      `Cannot insert a '${chalk.white(this._insertType)}'. There is already a '${chalk.white(
        this._insertType,
      )}' with that id '${chalk.white(this._id)}'`,
    );
    return text;
  }
}
