import didYouMean from 'didyoumean2';
import SE_MissingScriptError from './errors/MissingScriptError';
import LeafResult from './Result/LeafResult';
import Result from './Result/Result';
import SE_BRANCH from './Tree/Branch';
import { HookHandler } from './Tree/hooks';
import SE_LEAF from './Tree/Leaf';
import NodeManager from './Tree/NodeManager';
import SE_ROOT from './Tree/Root';
import SE_SENTINEL from './Tree/Sentinel';

interface runOption {
  crash: boolean;
}

export default class Executor {
  private treeRoot: SE_ROOT;

  constructor(treeRoot: SE_ROOT) {
    this.treeRoot = treeRoot;
  }

  public async run(identifier: string, options: runOption): Promise<Result> {
    const leaf = await NodeManager.getLeaf(this.treeRoot, identifier);
    if (!leaf) {
      // No leaf found with the given identifier
      const leaves = await NodeManager.getLeaves(this.treeRoot);
      const bestMatch = didYouMean(
        identifier,
        leaves.map((leaf) => leaf.identifier),
      );
      throw new SE_MissingScriptError(identifier, bestMatch);
    }
    const result = await this.exec(leaf, options);
    return result;
  }

  private async exec(leaf: SE_LEAF, options: runOption): Promise<Result> {
    let result: Result = LeafResult.fromPayload(leaf, '');
    let hasCrash = false;
    let catchError: unknown;

    try {
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
    } catch (error) {
      hasCrash = true;
      catchError = error;
    }

    if (hasCrash) {
      let errorResult: Result;
      if (catchError instanceof Result) {
        const rootParent = catchError.getRootParent();
        const leafResult = LeafResult.fromChild(leaf, rootParent);
        rootParent.setParent(leafResult);
        errorResult = catchError;
      } else {
        errorResult = LeafResult.fromError(leaf, catchError);
      }
      if (options.crash) {
        throw errorResult;
      }
      return errorResult;
    }
    return result;
  }

  private async execLeaf(leaf: SE_LEAF): Promise<Result> {
    const valueReceived = await leaf.exec();
    if (valueReceived instanceof Result) {
      const rootParent = valueReceived.getRootParent();
      const leafResult = LeafResult.fromChild(leaf, rootParent);
      rootParent.setParent(leafResult);
      return valueReceived;
    } else {
      return LeafResult.fromPayload(leaf, valueReceived);
    }
  }
}
