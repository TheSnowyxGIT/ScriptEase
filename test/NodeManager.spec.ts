import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import SE_BRANCH from '../src/Tree/Branch';
import SE_LEAF from '../src/Tree/Leaf';
import SE_NODE from '../src/Tree/Node';
import NodeManager from '../src/Tree/NodeManager';
import SE_ROOT from '../src/Tree/Root';
import SE_SENTINEL from '../src/Tree/Sentinel';

chai.use(chaiAsPromised);

describe('NodeManager', () => {
  describe('localHasLeaf', () => {
    it('empty branch', () => {
      const branch = new SE_BRANCH('branch');
      const leaf = new SE_LEAF('leaf', () => {});
      chai.expect(NodeManager.localHasLeaf(branch, leaf)).to.be.false;
    });

    it('not empty branch, but search for non inserted leaf', () => {
      const branch = new SE_BRANCH('branch');
      const leaf = new SE_LEAF('leaf', () => {});
      const leaf2 = new SE_LEAF('leaf2', () => {});
      branch.addNode(leaf);
      chai.expect(NodeManager.localHasLeaf(branch, leaf2)).to.be.false;
    });

    it('not empty branch and search for inserted leaves', () => {
      const branch = new SE_BRANCH('branch');
      const leaf = new SE_LEAF('leaf', () => {});
      const leaf2 = new SE_LEAF('leaf2', () => {});
      branch.addNode(leaf);
      branch.addNode(leaf2);
      chai.expect(NodeManager.localHasLeaf(branch, leaf2)).to.be.true;
      chai.expect(NodeManager.localHasLeaf(branch, leaf)).to.be.true;
    });
  });

  describe('localHasBranch & localBranchCount', () => {
    it('empty branch', () => {
      const branch = new SE_BRANCH('branch');
      chai.expect(NodeManager.localHasBranch(branch, 'subBranch')).to.be.false;
    });

    it('not empty branch, and search for a inserted branch', () => {
      const branch = new SE_BRANCH('branch');
      const branch2 = new SE_BRANCH('subBranch');
      branch.addNode(branch2);
      chai.expect(NodeManager.localHasBranch(branch, 'subBranch')).to.be.true;
    });

    it('multiple identical branch count', () => {
      const branch = new SE_BRANCH('branch');
      const branch2 = new SE_BRANCH('subBranch');
      const branch3 = new SE_BRANCH('subBranch');
      const branch4 = new SE_BRANCH('subBranch2');
      branch.addNode(branch2);
      branch.addNode(branch3);
      branch.addNode(branch4);
      chai.expect(NodeManager.localBranchCount(branch, 'subBranch')).to.be.eq(2);
      chai.expect(NodeManager.localBranchCount(branch, 'subBranch2')).to.be.eq(1);
      chai.expect(NodeManager.localBranchCount(branch, 'subBranch3')).to.be.eq(0);
      chai.expect(NodeManager.localHasBranch(branch, 'subBranch')).to.be.true;
      chai.expect(NodeManager.localHasBranch(branch, 'subBranch2')).to.be.true;
      chai.expect(NodeManager.localHasBranch(branch, 'subBranch3')).to.be.false;
    });
  });

  describe('wayTraversal', () => {
    let root: SE_ROOT;
    let sent1: SE_SENTINEL;
    let sent2: SE_SENTINEL;
    let leaf1: SE_LEAF;
    let branch: SE_BRANCH;
    let leaf2: SE_LEAF;
    let leaf3: SE_LEAF;

    beforeEach(() => {
      root = new SE_ROOT();
      sent1 = new SE_SENTINEL('file1');
      sent2 = new SE_SENTINEL('file2');
      root.addSentinel(sent1);
      root.addSentinel(sent2);
      sent1.addNode((leaf1 = new SE_LEAF('1', () => {})));
      branch = new SE_BRANCH('branch');
      sent2.addNode((leaf2 = new SE_LEAF('2', () => {})));
      sent2.addNode(branch);
      branch.addNode((leaf3 = new SE_LEAF('3', () => {})));
    });

    it('basic traversal', async () => {
      let maxDepth = 0;
      await NodeManager.wayTraversal(leaf1, {
        prefixe: {
          exec: async (node, depth) => {
            maxDepth = Math.max(maxDepth, depth);
          },
        },
      });
      expect(maxDepth).to.be.eq(2);
      maxDepth = 0;
      await NodeManager.wayTraversal(leaf3, {
        prefixe: {
          exec: async (node, depth) => {
            maxDepth = Math.max(maxDepth, depth);
          },
        },
      });
      expect(maxDepth).to.be.eq(3);
    });

    it('basic traversal, check prefix and suffix', async () => {
      const wayPrefix: SE_NODE[] = [];
      const waySuffix: SE_NODE[] = [];
      await NodeManager.wayTraversal(leaf3, {
        prefixe: {
          exec: async (node) => {
            wayPrefix.push(node);
          },
        },
        suffixe: {
          exec: async (node) => {
            waySuffix.push(node);
          },
        },
      });
      expect(wayPrefix).to.be.deep.eq([root, sent2, branch, leaf3]);
      expect(waySuffix).to.be.deep.eq([leaf3, branch, sent2, root]);
    });

    it('basic traversal, check filter', async () => {
      const wayPrefix: SE_NODE[] = [];
      await NodeManager.wayTraversal(leaf3, {
        prefixe: {
          filter: (node) => node instanceof SE_LEAF,
          exec: async (node) => {
            wayPrefix.push(node);
          },
        },
      });
      expect(wayPrefix).to.be.deep.eq([leaf3]);
    });
  });

  describe('dfs', () => {
    let root: SE_ROOT;
    let sent1: SE_SENTINEL;
    let sent2: SE_SENTINEL;
    let leaf1: SE_LEAF;
    let branch: SE_BRANCH;
    let leaf2: SE_LEAF;
    let leaf3: SE_LEAF;

    beforeEach(() => {
      root = new SE_ROOT();
      sent1 = new SE_SENTINEL('file1');
      sent2 = new SE_SENTINEL('file2');
      root.addSentinel(sent1);
      root.addSentinel(sent2);
      sent1.addNode((leaf1 = new SE_LEAF('1', () => {})));
      branch = new SE_BRANCH('branch');
      sent2.addNode((leaf2 = new SE_LEAF('2', () => {})));
      sent2.addNode(branch);
      branch.addNode((leaf3 = new SE_LEAF('3', () => {})));
    });

    it('basic traversal', async () => {
      let maxDepth = 0;
      await NodeManager.dfs(root, {
        prefixe: {
          exec: async (node, depth) => {
            maxDepth = Math.max(maxDepth, depth);
          },
        },
      });
      expect(maxDepth).to.be.eq(3);
    });

    it('basic traversal, check prefix and suffix', async () => {
      const wayPrefix: SE_NODE[] = [];
      const waySuffix: SE_NODE[] = [];
      await NodeManager.dfs(root, {
        prefixe: {
          exec: async (node) => {
            wayPrefix.push(node);
          },
        },
        suffixe: {
          exec: async (node) => {
            waySuffix.push(node);
          },
        },
      });
      expect(wayPrefix).to.be.deep.eq([root, sent1, leaf1, sent2, leaf2, branch, leaf3]);
      expect(waySuffix).to.be.deep.eq([leaf1, sent1, leaf2, leaf3, branch, sent2, root]);
    });
  });
});
