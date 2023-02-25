import * as chalk from 'chalk';
import SE_ROOT from '../Tree/Root';
import SE_ERROR from './SeError';

export default class SE_MissingScriptError extends SE_ERROR {
  public name = 'SE_MissingScriptError';
  private _identifier: string;
  private _root: SE_ROOT;

  constructor(identifier: string, root: SE_ROOT) {
    super();
    this._identifier = identifier;
    this._root = root;
  }

  private get bestMatch() {
    return 'TODO';
  }

  toString() {
    let text = chalk.gray("It seems that the script you want to execute does not exists : '");
    text += chalk.white(this._identifier) + chalk.gray("'");
    text += `\n\t${chalk.gray(`Did you mean '${chalk.white(this.bestMatch)}'`)}`;
    return text;
  }
}
