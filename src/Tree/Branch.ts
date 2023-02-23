import SE_DuplicateNodeBuildError from '../errors/Build/SeDuplicateNodeBuildError';
import { AfterEachhook, AfterOncehook, BeforeEachhook, BeforeOncehook, Hookable } from './hooks';
import SE_LEAF from './Leaf';
import SE_NODE from './Node';
import NodeManager from './NodeManager';
import SE_SENTINEL from './Sentinel';

class SE_BRANCH extends SE_NODE implements Hookable {
  private _nodes: (SE_BRANCH | SE_LEAF)[];
  private _identifier: string;
  private _fullIdentifier: string;

  public get nodes() {
    return this._nodes;
  }

  public get identifier() {
    return this._identifier;
  }

  public get fullIdentifier() {
    return this._fullIdentifier;
  }

  // Hooks
  public beforeOnce?: BeforeOncehook;
  public afterOnce?: AfterOncehook;
  public beforeEach?: BeforeEachhook;
  public afterEach?: AfterEachhook;

  constructor(identifier: string) {
    super('branch');
    this._identifier = identifier;
    this._fullIdentifier = identifier;
    this._nodes = [];
  }

  public addNode(node: SE_BRANCH | SE_LEAF) {
    if (node instanceof SE_LEAF && NodeManager.localHasLeaf(this, node)) {
      throw new SE_DuplicateNodeBuildError(node.type, this.fullIdentifier + ':' + node.identifier);
    }
    this._nodes.push(node);
    node.onAdded(this);
  }

  public childCount(): number {
    return Object.keys(this._nodes).length;
  }

  public isEmpty(): boolean {
    return this.childCount() === 0;
  }

  /** @override functions */
  public override describe(): string {
    return `<Branch identifier=${this.identifier} id=TODO />`;
  }

  public equals(node: SE_BRANCH): boolean {
    throw new Error('Method not implemented.');
  }

  public override onAdded(parent: SE_BRANCH | SE_SENTINEL): void {
    if (parent instanceof SE_BRANCH) {
      this._fullIdentifier = parent.fullIdentifier + ':' + this.identifier;
    } else {
      this._fullIdentifier = this.identifier;
    }
    this._way = parent.getWay().concat([parent]);
    for (const child of this.nodes) {
      child.onAdded(this);
    }
  }
}
export default SE_BRANCH;
