import * as chalk from 'chalk';
import SE_DefaultError from '../errors/SeDefaultError';
import Result, { STATE } from './Result';

export default class ExecResult extends Result {
  protected type = 'exec';
  private _code: number;
  private _cmd: string;

  constructor(cmd: string, code: number) {
    super();
    this._code = code;
    this._cmd = cmd;
  }

  public geCode() {
    return this._code;
  }

  public geCmd() {
    return this._cmd;
  }

  public override setError(): void {
    throw new SE_DefaultError('cannot add an error to a ExecResult');
  }

  public override getState(): STATE {
    return this._code === 0 ? STATE.OK : STATE.KO;
  }

  protected stringSuite(indent: number): string {
    return '\n' + this.indent(indent, chalk.gray(`code: ${this._code}`));
  }
}
