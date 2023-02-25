import * as chalk from 'chalk';
import Result, { showOptions, STATE } from './Result';

export default class ExecResult extends Result {
  protected defaultName = 'ExecResult';
  private _code: number;

  public geCode() {
    return this._code;
  }

  constructor(code: number) {
    super();
    this._code = code;
  }

  public override getState(): STATE {
    return this._code === 0 ? STATE.VALID : STATE.NOVALID;
  }

  public show(options: showOptions): void {
    let text = this.getStartShow(options.maxNameLength);
    text += chalk.gray(` (code: ${chalk.white(this._code)})`);
    this.logIndent(options.indent, text);
  }
}
