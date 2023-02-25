import SE_MissingScriptError from './errors/MissingScriptError';
import ErrorResult from './Results/ErrorLeafResult';
import PayloadLeafResult from './Results/PayloadLeafResult';
import Result from './Results/Result';
import ResultLeafResult from './Results/ResultLeafResult';
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
      throw new SE_MissingScriptError(identifier, this.treeRoot);
    }
    const result = await this.exec(leaf, options);
    return result;
  }

  private async exec(leaf: SE_LEAF, options: runOption): Promise<Result> {
    let result: Result = new PayloadLeafResult(leaf, '');
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
      const errorResult = new ErrorResult(leaf, catchError);
      if (options.crash) {
        throw errorResult;
      }
      return errorResult;
    }
    return result;
  }

  private async execLeaf(leaf: SE_LEAF): Promise<Result> {
    const valueReceived = await leaf.exec();
    let result: Result;
    if (valueReceived instanceof Result) {
      result = new ResultLeafResult(leaf, valueReceived);
    } else {
      result = new PayloadLeafResult(leaf, valueReceived);
    }
    return result;
  }
}
