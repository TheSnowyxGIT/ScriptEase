import * as chalk from 'chalk';
import SE_LEAF from '../Tree/Leaf';
import LeafResult from './LeafResult';
import Result, { showOptions, STATE } from './Result';

export default class ErrorLeafResult extends LeafResult {
  protected defaultName = 'ErrorResult';
  private _error: unknown = undefined;
  public getError() {
    return this._error;
  }

  constructor(leaf: SE_LEAF, error: unknown) {
    super(leaf);
    this._error = error;
  }

  public override getState(): STATE {
    return STATE.NOVALID;
  }

  private showError(indent: number) {
    if (this._error instanceof Result) {
      this._error.show({ indent: indent + 1 });
    } else {
      console.log(this._error);
    }
  }

  public show(options: showOptions): void {
    const text = this.getStartShow(options.maxNameLength) + chalk.gray('. Object thrown :');
    this.logIndent(options.indent, text);
    this.showError(options.indent);
  }
}
