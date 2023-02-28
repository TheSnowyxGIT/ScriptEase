import SE_DefaultError from '../errors/SeDefaultError';
import Result, { STATE, stringOptions } from './Result';

export default class MultipleResult<T extends Result> extends Result {
  protected type = 'suite';
  private _results: T[];

  constructor(results?: T[]) {
    super();
    this._results = results || [];
  }

  public add(result: T) {
    this._results.push(result);
  }

  public getResults() {
    return this._results;
  }

  public override setError(): void {
    throw new SE_DefaultError('cannot add an error to a MultipleResult');
  }

  public override getState(): STATE {
    const valid = this._results.reduce((valid, cur) => {
      return valid && cur.isOK();
    }, true);
    return valid ? STATE.OK : STATE.KO;
  }

  private getMaxNameLength(): number {
    let maxLength = this.getDisplayName().length;
    for (const result of this._results) {
      maxLength = Math.max(result.getDisplayName().length, maxLength);
    }
    return maxLength;
  }

  protected stringSuite(indent: number): string {
    let text = '';
    for (const result of this._results) {
      const rootParent = result.getRootParent();
      const newOption: stringOptions = {
        indent,
      };
      newOption.maxNameLength = this.getMaxNameLength();
      text += '\n' + rootParent.toString(newOption);
    }
    return text;
  }
}
