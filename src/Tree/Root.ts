import SE_DuplicateNodeBuildError from '../errors/Build/SeDuplicateNodeBuildError';
import { AfterEachhook, AfterOncehook, BeforeEachhook, BeforeOncehook, Hookable } from './hooks';
import SE_NODE from './Node';
import SE_SENTINEL from './Sentinel';

class SE_ROOT extends SE_NODE implements Hookable {
  private _sentinels: Record<string, SE_SENTINEL>;

  public get sentinels() {
    return this._sentinels;
  }

  // Hooks
  public beforeOnce?: BeforeOncehook;
  public afterOnce?: AfterOncehook;
  public beforeEach?: BeforeEachhook;
  public afterEach?: AfterEachhook;

  constructor() {
    super('root');
    this._sentinels = {};
    this.onAdded(null);
  }

  /** @override functions */
  public override describe(): string {
    return `<Root/>`;
  }

  public override equals(node: SE_ROOT): boolean {
    throw new Error('Method not implemented.');
  }

  public override onAdded(parent: null): void {
    // useless (called in the constructor of a root)
    return;
  }

  public addSentinel(sentinel: SE_SENTINEL) {
    if (this.sentinels[sentinel.filePath]) {
      throw new SE_DuplicateNodeBuildError(sentinel.type, sentinel.filePath);
    }
    this.sentinels[sentinel.filePath] = sentinel;
    sentinel.onAdded(this);
  }

  public sentinelsCount(): number {
    return Object.keys(this.sentinels).length;
  }

  public isEmpty(): boolean {
    return this.sentinelsCount() === 0;
  }

  public getSentinels(): SE_SENTINEL[] {
    return Object.values(this.sentinels);
  }

  public getSentinelByIndex(index: number): SE_SENTINEL | undefined {
    return Object.values(this.sentinels).at(index);
  }

  public getSentinelByPath(filePath: string): SE_SENTINEL | undefined {
    return this.sentinels[filePath];
  }
}
export default SE_ROOT;
