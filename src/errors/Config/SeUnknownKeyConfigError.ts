import * as chalk from 'chalk';
import SE_InvalidConfigError from './SeInvalidConfig';

export default class SE_UnknownKeyConfigError extends SE_InvalidConfigError {
  public name: string = 'SE_UnknownKeyConfigError';
  private _key: string;

  constructor(key: string) {
    super('');
    this._key = key;
  }

  public toString(): string {
    let text = chalk.gray(`The key '${chalk.white(this._key)}' is unknown.`);
    return text;
  }
}
