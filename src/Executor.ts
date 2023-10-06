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
import { logger } from './Logger/Logger';
import LoggerContext from './Logger/LoggerContext';

interface runOption {
  crash: boolean;
}

export default class Executor {
  private treeRoot: SE_ROOT;
  private loggerContext: LoggerContext;

  constructor(treeRoot: SE_ROOT) {
    this.treeRoot = treeRoot;
    this.loggerContext = new LoggerContext(logger, 'Executor');
    this.loggerContext.define('runLeaf', {
      minLogLevel: 1,
      writer: (logLevel, identifier: string) => {
        return `run '${identifier}'`;
      },
    });
    this.loggerContext.define('runBeforeOnce', {
      minLogLevel: 1,
      writer: (logLevel, data: { node: SE_BRANCH | SE_SENTINEL | SE_ROOT }) => {
        if (data.node instanceof SE_BRANCH) {
          return `run BeforeOnce in '${data.node.fullIdentifier}'`;
        } else if (data.node instanceof SE_SENTINEL) {
          return `run BeforeOnce in '${data.node.relativePath}'`;
        } else {
          return `run BeforeOnce in root`;
        }
      },
    });
    this.loggerContext.define('runAfterOnce', {
      minLogLevel: 1,
      writer: (logLevel, data: { node: SE_BRANCH | SE_SENTINEL | SE_ROOT }) => {
        if (data.node instanceof SE_BRANCH) {
          return `run AfterOnce in '${data.node.fullIdentifier}'`;
        } else if (data.node instanceof SE_SENTINEL) {
          return `run AfterOnce in '${data.node.relativePath}'`;
        } else {
          return `run AfterOnce in root`;
        }
      },
    });
    this.loggerContext.define('runBeforeEach', {
      minLogLevel: 1,
      writer: (logLevel, data: { node: SE_BRANCH | SE_SENTINEL | SE_ROOT }) => {
        if (data.node instanceof SE_BRANCH) {
          return `run BeforeEach in '${data.node.fullIdentifier}'`;
        } else if (data.node instanceof SE_SENTINEL) {
          return `run BeforeEach in '${data.node.relativePath}'`;
        } else {
          return `run BeforeEach in root`;
        }
      },
    });
    this.loggerContext.define('runAfterEach', {
      minLogLevel: 1,
      writer: (logLevel, data: { node: SE_BRANCH | SE_SENTINEL | SE_ROOT }) => {
        if (data.node instanceof SE_BRANCH) {
          return `run AfterEach in '${data.node.fullIdentifier}'`;
        } else if (data.node instanceof SE_SENTINEL) {
          return `run AfterEach in '${data.node.relativePath}'`;
        } else {
          return `run AfterEach in root`;
        }
      },
    });
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
              await hh.runBeforeOnce(this.loggerContext);
              await hh.runBeforeEach(leaf.fullIdentifier, this.loggerContext);
            }
          },
        },
        suffixe: {
          exec: async (node, depth) => {
            if (node instanceof SE_ROOT || node instanceof SE_BRANCH || node instanceof SE_SENTINEL) {
              const hh = new HookHandler(node);
              await hh.runAfterEach(leaf.fullIdentifier, this.loggerContext);
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
    this.loggerContext.send('runLeaf', leaf.identifier);
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
