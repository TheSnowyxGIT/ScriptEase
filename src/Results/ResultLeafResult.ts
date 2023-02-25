import SE_LEAF from '../Tree/Leaf';
import LeafResult from './LeafResult';
import Result, { showOptions, STATE } from './Result';

export default class ResultLeafResult extends LeafResult {
  protected defaultName = 'ResultLeafResult';
  private _result: Result;

  constructor(leaf: SE_LEAF, result: Result) {
    super(leaf);
    this._result = result;
    this._result.name = this.name;
  }

  public getResult(): Result {
    return this._result;
  }

  public getState(): STATE {
    return this._result.getState();
  }

  public show(option: showOptions): void {
    this._result.show(option);
  }
}
