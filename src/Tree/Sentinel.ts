import SE_DuplicateNodeBuildError from '../errors/Build/SeDuplicateNodeBuildError';
import SE_BRANCH from './Branch';
import { AfterEachhook, AfterOncehook, BeforeEachhook, BeforeOncehook, Hookable } from './hooks';
import SE_LEAF from './Leaf';
import SE_NODE from './Node';
import NodeManager from './NodeManager';
import SE_ROOT from './Root';

class SE_SENTINEL extends SE_NODE implements Hookable {
  private _filePath: string;
  private _nodes: (SE_BRANCH | SE_LEAF)[];

  public get filePath() {
    return this._filePath;
  }

  public get relativePath() {
    return this.filePath.replace(process.cwd(), '');
  }

  public get nodes() {
    return this._nodes;
  }

  // Hooks
  public beforeOnce?: BeforeOncehook;
  public afterOnce?: AfterOncehook;
  public beforeEach?: BeforeEachhook;
  public afterEach?: AfterEachhook;

  constructor(filePath: string) {
    super('sentinel');
    this._nodes = [];
    this._filePath = filePath;
  }

  /** @override functions */
  public override describe(): string {
    return `<Sentinel filepath=${this.filePath} />`;
  }

  public override equals(node: SE_SENTINEL): boolean {
    return this.filePath === node.filePath;
  }

  public override onAdded(parent: SE_ROOT): void {
    this._way = parent.getWay().concat([parent]);
    for (const child of this.nodes) {
      child.onAdded(this);
    }
    return;
  }

  public addNode(node: SE_BRANCH | SE_LEAF) {
    if (node instanceof SE_LEAF && NodeManager.localHasLeaf(this, node)) {
      throw new SE_DuplicateNodeBuildError(node.type, node.identifier);
    }
    this.nodes.push(node);
    node.onAdded(this);
  }

  public childCount(): number {
    return Object.keys(this.nodes).length;
  }

  public isEmpty(): boolean {
    return this.childCount() === 0;
  }
}
export default SE_SENTINEL;
