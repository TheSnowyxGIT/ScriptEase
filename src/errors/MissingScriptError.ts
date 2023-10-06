import * as chalk from 'chalk';
import SE_ROOT from '../Tree/Root';
import SE_ERROR from './SeError';
import didYouMean from 'didyoumean2';
import NodeManager from 'src/Tree/NodeManager';

export default class SE_MissingScriptError extends SE_ERROR {
  public name = 'SE_MissingScriptError';
  private _identifier: string;
  private _bestMatch: string | null;

  constructor(identifier: string, bestMatch: string | null) {
    super();
    this._identifier = identifier;
    this._bestMatch = bestMatch;
  }

  private get bestMatch() {
    return this._bestMatch;
  }

  toString() {
    let text = chalk.gray("It seems that the script you want to execute does not exists : '");
    text += chalk.white(this._identifier) + chalk.gray("'");
    if (this.bestMatch) {
      text += `\n\t${chalk.gray(`Did you mean '${chalk.white(this.bestMatch)}'`)}`;
    }
    return text;
  }
}
