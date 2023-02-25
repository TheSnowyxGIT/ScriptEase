import Result, { showOptions, STATE } from './Result';

export default class BasicResult extends Result {
  protected defaultName = 'BasicResult';
  private _valid: boolean;

  constructor(valid: boolean) {
    super();
    this._valid = valid;
  }

  public override getState(): STATE {
    return this._valid ? STATE.VALID : STATE.NOVALID;
  }

  public show(options: showOptions): void {
    const text = this.getStartShow(options.maxNameLength);
    this.logIndent(options.indent, text);
  }
}
