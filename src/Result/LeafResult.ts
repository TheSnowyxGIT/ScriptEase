import SE_LEAF from '../Tree/Leaf';
import Result, { STATE } from './Result';

export default class LeafResult extends Result {
  private _leaf: SE_LEAF;
  private _child: Result | null = null;

  public static fromError(leaf: SE_LEAF, error: unknown): LeafResult {
    const result = new LeafResult(leaf);
    result.setError(error);
    return result;
  }

  public static fromPayload(leaf: SE_LEAF, payload: unknown): LeafResult {
    const result = new LeafResult(leaf);
    result.setPayload(payload);
    return result;
  }

  public static fromChild(leaf: SE_LEAF, child: Result): LeafResult {
    const result = new LeafResult(leaf);
    result.setChild(child);
    return result;
  }

  public override getDisplayName(): string {
    const displayName = `leaf[${this._leaf.fullIdentifier}]`;
    if (this.type !== 'default') {
      return `${displayName} as ${this.type}`;
    }
    return displayName;
  }

  constructor(leaf: SE_LEAF) {
    super();
    this._leaf = leaf;
  }

  private setChild(result: Result) {
    this._child = result;
  }

  public override getState(): STATE {
    if (this.getError() !== null) {
      return STATE.KO;
    }
    if (this._child !== null) {
      return this._child.isKO() ? STATE.KO : STATE.OK;
    }
    return STATE.OK;
  }

  protected stringSuite(indent: number): string {
    let text = '';
    if (this._child) {
      text = '\n' + this._child.toString({ indent: indent });
    }
    return text;
  }
}
