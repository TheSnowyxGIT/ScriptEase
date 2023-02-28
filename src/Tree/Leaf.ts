import Result from '../Result/Result';
import SE_BRANCH from './Branch';
import SE_NODE from './Node';
import SE_SENTINEL from './Sentinel';

export type LeafExec = () => Promise<Result> | Result | unknown;

class SE_LEAF extends SE_NODE {
  private _identifier: string;
  private _fullIdentifier: string;
  private _exec: LeafExec;

  public get identifier() {
    return this._identifier;
  }

  public get fullIdentifier() {
    return this._fullIdentifier;
  }

  public get exec() {
    return this._exec;
  }

  constructor(identifier: string, exec: LeafExec) {
    super('leaf');
    this._identifier = identifier;
    this._fullIdentifier = identifier;
    this._exec = exec;
  }

  /** @override functions */
  public override describe(): string {
    return `<Leaf identifier=${this.identifier} />`;
  }

  public override equals(node: SE_LEAF): boolean {
    return this.identifier == node.identifier;
  }

  public override onAdded(parent: SE_BRANCH | SE_SENTINEL): void {
    if (parent instanceof SE_BRANCH) {
      this._fullIdentifier = parent.fullIdentifier + ':' + this.identifier;
    } else {
      this._fullIdentifier = this.identifier;
    }
    this._way = parent.getWay().concat([parent]);
  }
}
export default SE_LEAF;
