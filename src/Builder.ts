import SE_InsertBuildError from './errors/Build/SeInsertBuildError';
import SE_MoveHeadBuildError from './errors/Build/SeMoveHeadBuildError';
import SE_DuplicatedLeavesError from './errors/SeDupplicatedLeavesError';
import SE_BRANCH from './Tree/Branch';
import SE_LEAF from './Tree/Leaf';
import SE_NODE from './Tree/Node';
import NodeManager from './Tree/NodeManager';
import SE_ROOT from './Tree/Root';
import SE_SENTINEL from './Tree/Sentinel';

export default class Builder {
  private treeRoot: SE_ROOT;
  private contextQueue: (SE_ROOT | SE_SENTINEL | SE_BRANCH)[];

  constructor(treeRoot: SE_ROOT) {
    this.treeRoot = treeRoot;
    this.contextQueue = [treeRoot];
  }

  private getHead(): SE_ROOT | SE_SENTINEL | SE_BRANCH {
    return this.contextQueue[this.contextQueue.length - 1];
  }

  private insertSentinel(sentinel: SE_SENTINEL) {
    const head = this.getHead();
    if (head instanceof SE_ROOT) {
      head.addSentinel(sentinel);
    } else {
      throw new SE_InsertBuildError(sentinel.type, head.type);
    }
  }

  private insertBranch(branch: SE_BRANCH) {
    const head = this.getHead();
    if (head instanceof SE_SENTINEL || head instanceof SE_BRANCH) {
      head.addNode(branch);
    } else {
      throw new SE_InsertBuildError(branch.type, head.type);
    }
  }

  private insertLeaf(leaf: SE_LEAF) {
    const head = this.getHead();
    if (head instanceof SE_SENTINEL || head instanceof SE_BRANCH) {
      head.addNode(leaf);
    } else {
      throw new SE_InsertBuildError(leaf.type, head.type);
    }
  }

  public insert(node: SE_NODE): SE_NODE {
    if (node instanceof SE_ROOT) {
      throw new SE_InsertBuildError(node.type);
    } else if (node instanceof SE_SENTINEL) {
      this.insertSentinel(node);
    } else if (node instanceof SE_BRANCH) {
      this.insertBranch(node);
    } else if (node instanceof SE_LEAF) {
      this.insertLeaf(node);
    }
    node.onAdded(this.getHead());
    return node;
  }

  public moveHeadBack() {
    if (this.contextQueue.length <= 1) {
      throw new SE_MoveHeadBuildError('Cannot move head back. Already in the root');
    }
    this.contextQueue.pop();
  }

  public moveHeadTo(node: SE_ROOT | SE_SENTINEL | SE_BRANCH) {
    this.contextQueue.push(node);
  }

  public async checkBuild() {
    await this.checkDuplicatedLeaves();
  }

  public async checkDuplicatedLeaves() {
    let allIdentifiers: Record<string, number> = {};
    await NodeManager.forEachLeaves(this.treeRoot, async (leaf) => {
      const fullIdentifier = leaf.fullIdentifier;
      if (!allIdentifiers[fullIdentifier]) {
        allIdentifiers[fullIdentifier] = 0;
      }
      allIdentifiers[fullIdentifier] += 1;
    });
    const allDuplicatedLeaves = Object.entries(allIdentifiers)
      .filter((entry) => entry[1] > 1)
      .map(([identifier, occurences]) => ({ identifier, occurences }));
    if (allDuplicatedLeaves.length > 0) {
      throw new SE_DuplicatedLeavesError(allDuplicatedLeaves);
    }
  }
}
