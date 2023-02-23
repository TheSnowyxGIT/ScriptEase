import * as chalk from 'chalk';
import SE_InvalidConfigError from './SeInvalidConfig';

export default class SE_InvalidTypeConfigError extends SE_InvalidConfigError {
  public name = 'SE_InvalidTypeConfigError';
  private _key: string;
  private _expectedType: string;
  private _actualType: string;

  constructor(key: string, expectedType: string, actualType: string) {
    super('');
    this._key = key;
    this._expectedType = expectedType;
    this._actualType = actualType;
  }

  public toString(): string {
    const text = chalk.gray(
      `Invalid config value for key ${chalk.white(this._key)}. Expected ${chalk.white(
        this._expectedType,
      )} but got ${chalk.white(this._actualType)}.`,
    );
    return text;
  }
}
