import Result, { showOptions, STATE } from './Result';

export default class MultipleResult extends Result {
  protected defaultName = 'MultipleResult';
  private _results: Result[];

  constructor(results?: Result[]) {
    super();
    this._results = results || [];
  }

  public add(result: Result) {
    this._results.push(result);
  }

  public override getState(): STATE {
    const valid = this._results.reduce((valid, cur) => {
      return valid && cur.getState() === STATE.VALID;
    }, true);
    return valid ? STATE.VALID : STATE.NOVALID;
  }

  private getMaxNameLength(): number {
    let maxLength = 0;
    for (const result of this._results) {
      maxLength = Math.max(result.name.length, maxLength);
    }
    return maxLength;
  }

  public show(option: showOptions): void {
    const text = this.getStartShow(option.maxNameLength);
    this.logIndent(option.indent, text);
    for (const result of this._results) {
      const newOption: showOptions = Object.assign({}, option);
      newOption.indent += 1;
      newOption.maxNameLength = this.getMaxNameLength();
      result.show(newOption);
    }
  }
}
