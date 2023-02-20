import Result from './Result';
import SE_BRANCH from './Tree/Branch';
import { EachHook, Hookable, HookHandler, OnceHook } from './Tree/hooks';
import SE_LEAF from './Tree/Leaf';
import NodeManager from './Tree/NodeManager';
import SE_ROOT from './Tree/Root';
import SE_SENTINEL from './Tree/Sentinel';

export default class Executor {
  private treeRoot: SE_ROOT;

  constructor(treeRoot: SE_ROOT) {
    this.treeRoot = treeRoot;
  }

  public async run(identifier: string): Promise<Result> {
    const leaf = await NodeManager.getLeaf(this.treeRoot, identifier);
    if (!leaf) {
      // No leaf found with the given identifier
      throw new Error('TODO');
    }
    const result = await this.exec(leaf);
    return result;
  }

  private async exec(leaf: SE_LEAF): Promise<Result> {
    let result: Result;

    await NodeManager.wayTraversal(leaf, {
      prefixe: {
        exec: async (node, depth) => {
          if (node instanceof SE_LEAF) {
            // its the destination
            result = await this.execLeaf(node);
          }
          if (node instanceof SE_ROOT) {
            // nothing for now
          }
          if (node instanceof SE_ROOT || node instanceof SE_BRANCH || node instanceof SE_SENTINEL) {
            const hh = new HookHandler(node);
            await hh.runBeforeOnce();
            await hh.runBeforeEach(leaf.fullIdentifier);
          }
        },
      },
      suffixe: {
        exec: async (node, depth) => {
          if (node instanceof SE_ROOT || node instanceof SE_BRANCH || node instanceof SE_SENTINEL) {
            const hh = new HookHandler(node);
            await hh.runAfterEach(leaf.fullIdentifier);
          }
        },
      },
    });

    // @ts-ignore
    return result;
  }

  private async execLeaf(leaf: SE_LEAF): Promise<Result> {
    const result = (await leaf.exec()) || new Result();
    return result;
  }
}
