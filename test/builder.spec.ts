import Builder from '../src/Builder';
import SE_BRANCH from '../src/Tree/Branch';
import SE_LEAF from '../src/Tree/Leaf';
import NodeManager from '../src/Tree/NodeManager';
import SE_ROOT from '../src/Tree/Root';
import SE_SENTINEL from '../src/Tree/Sentinel';

import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

describe('Builder', () => {
  it('empty tree', () => {
    const root = new SE_ROOT();
    chai.expect(root.isEmpty()).to.be.true;
  });

  it('move head back on root (should throw)', () => {
    const root = new SE_ROOT();
    const builder = new Builder(root);
    chai.expect(() => builder.moveHeadBack()).to.throw();
  });

  it('move head back on sentinel', () => {
    const root = new SE_ROOT();
    const builder = new Builder(root);
    const sentinel = new SE_SENTINEL('myFilePath');
    builder.insert(sentinel);
    builder.moveHeadTo(sentinel);
    builder.moveHeadBack();
  });

  it('move head back twice on sentinel (should throw)', () => {
    const root = new SE_ROOT();
    const builder = new Builder(root);
    const sentinel = new SE_SENTINEL('myFilePath');
    builder.insert(sentinel);
    builder.moveHeadTo(sentinel);
    builder.moveHeadBack();
    chai.expect(() => builder.moveHeadBack()).to.throw();
  });

  it('insert two same sentinels, should throw', () => {
    const root = new SE_ROOT();
    const builder = new Builder(root);
    const sentinel = new SE_SENTINEL('myFilePath');
    const sentinel2 = new SE_SENTINEL('myFilePath');
    builder.insert(sentinel);
    chai.expect(() => builder.insert(sentinel2)).to.throw();
  });

  it('insert one sentinel', () => {
    const root = new SE_ROOT();
    const builder = new Builder(root);
    const sentinel = new SE_SENTINEL('myFilePath');
    builder.insert(sentinel);
    chai.expect(root.isEmpty()).to.be.false;
    chai.expect(root.sentinelsCount()).to.be.eq(1);
    chai.expect(root.getSentinelByIndex(0)).to.be.eq(sentinel);
    chai.expect(root.getSentinelByPath('myFilePath')).to.be.eq(sentinel);
  });

  it('insert two sentinel', () => {
    const root = new SE_ROOT();
    const builder = new Builder(root);
    const sentinel1 = new SE_SENTINEL('myFilePath');
    const sentinel2 = new SE_SENTINEL('myFilePath2');
    builder.insert(sentinel1);
    builder.insert(sentinel2);
    chai.expect(root.isEmpty()).to.be.false;
    chai.expect(root.sentinelsCount()).to.be.eq(2);
    chai.expect(root.getSentinelByIndex(1)).to.be.eq(sentinel2);
  });

  it('insert root into the root (should throw)', () => {
    const root = new SE_ROOT();
    const builder = new Builder(root);
    const newRoot = new SE_ROOT();
    chai.expect(() => builder.insert(newRoot)).to.throw();
  });

  it('insert branch into the root (should throw)', () => {
    const root = new SE_ROOT();
    const builder = new Builder(root);
    const branch = new SE_BRANCH('id');
    chai.expect(() => builder.insert(branch)).to.throw();
  });

  it('insert leaf into the root (should throw)', () => {
    const root = new SE_ROOT();
    const builder = new Builder(root);
    const leaf = new SE_LEAF('myidentifier', () => null);
    chai.expect(() => builder.insert(leaf)).to.throw();
  });

  describe('inside a sentinel', () => {
    let root: SE_ROOT;
    let builder: Builder;
    let sentinel: SE_SENTINEL;

    beforeEach(() => {
      root = new SE_ROOT();
      builder = new Builder(root);
      sentinel = new SE_SENTINEL('filepath');
      builder.insert(sentinel);
      builder.moveHeadTo(sentinel);
    });

    it('must be empty', () => {
      chai.expect(sentinel.isEmpty()).to.be.true;
      chai.expect(sentinel.childCount()).to.be.eq(0);
    });

    it('insert root into a sentinel (should throw)', () => {
      const newRoot = new SE_ROOT();
      chai.expect(() => builder.insert(newRoot)).to.throw();
    });

    it('insert sentinel into a sentinel (should throw)', () => {
      const anotherSentinel = new SE_SENTINEL('filepath2');
      chai.expect(() => builder.insert(anotherSentinel)).to.throw();
    });

    it('insert a leaf', async () => {
      const leaf = new SE_LEAF('id', () => null);
      builder.insert(leaf);
      chai.expect(sentinel.isEmpty()).to.be.false;
      chai.expect(sentinel.childCount()).to.be.eq(1);
      chai.expect(await NodeManager.hasLeaf(sentinel, leaf)).to.be.true;
    });

    it('insert two leaf', async () => {
      const leaf = new SE_LEAF('id', () => null);
      const leaf2 = new SE_LEAF('id2', () => null);
      builder.insert(leaf);
      builder.insert(leaf2);
      chai.expect(sentinel.isEmpty()).to.be.false;
      chai.expect(sentinel.childCount()).to.be.eq(2);
      chai.expect(await NodeManager.hasLeaf(sentinel, leaf)).to.be.true;
      chai.expect(await NodeManager.hasLeaf(sentinel, leaf2)).to.be.true;
    });

    it('insert two leaf (with the same identifier, should throw)', () => {
      const leaf = new SE_LEAF('id', () => null);
      const leaf2 = new SE_LEAF('id', () => null);
      builder.insert(leaf);
      chai.expect(() => builder.insert(leaf2)).to.throw();
    });

    it('insert a branch', () => {
      const branch = new SE_BRANCH('id');
      builder.insert(branch);
      chai.expect(sentinel.isEmpty()).to.be.false;
      chai.expect(sentinel.childCount()).to.be.eq(1);
      chai.expect(NodeManager.localHasBranch(sentinel, 'id')).to.be.true;
    });

    it('insert two branch', () => {
      const branch = new SE_BRANCH('id');
      const branch2 = new SE_BRANCH('id2');
      builder.insert(branch);
      builder.insert(branch2);
      chai.expect(sentinel.isEmpty()).to.be.false;
      chai.expect(sentinel.childCount()).to.be.eq(2);
      chai.expect(NodeManager.localHasBranch(sentinel, 'id')).to.be.true;
      chai.expect(NodeManager.localHasBranch(sentinel, 'id2')).to.be.true;
    });

    it('insert two branch (with same identifier)', () => {
      const branch = new SE_BRANCH('id');
      const branch2 = new SE_BRANCH('id');
      builder.insert(branch);
      builder.insert(branch2);
      chai.expect(sentinel.isEmpty()).to.be.false;
      chai.expect(sentinel.childCount()).to.be.eq(2);
      chai.expect(NodeManager.localHasBranch(sentinel, 'id')).to.be.true;
      chai.expect(NodeManager.localBranchCount(sentinel, 'id')).to.be.eq(2);
    });
  });

  describe('inside a branch', () => {
    let root: SE_ROOT;
    let builder: Builder;
    let sentinel: SE_SENTINEL;
    let branch: SE_BRANCH;

    beforeEach(() => {
      root = new SE_ROOT();
      builder = new Builder(root);
      sentinel = new SE_SENTINEL('filepath');
      builder.insert(sentinel);
      builder.moveHeadTo(sentinel);
      branch = new SE_BRANCH('id');
      builder.insert(branch);
      builder.moveHeadTo(branch);
    });

    it('must be empty', () => {
      chai.expect(branch.isEmpty()).to.be.true;
      chai.expect(branch.childCount()).to.be.eq(0);
    });

    it('insert root into a branch (should throw)', () => {
      const newRoot = new SE_ROOT();
      chai.expect(() => builder.insert(newRoot)).to.throw();
    });

    it('insert sentinel into a branch (should throw)', () => {
      const anotherSentinel = new SE_SENTINEL('filepath2');
      chai.expect(() => builder.insert(anotherSentinel)).to.throw();
    });

    it('insert a leaf', async () => {
      const leaf = new SE_LEAF('id', () => null);
      builder.insert(leaf);
      chai.expect(branch.isEmpty()).to.be.false;
      chai.expect(branch.childCount()).to.be.eq(1);
      chai.expect(await NodeManager.hasLeaf(branch, leaf)).to.be.true;
    });

    it('insert two leaf', () => {
      const leaf = new SE_LEAF('id', () => null);
      const leaf2 = new SE_LEAF('id2', () => null);
      builder.insert(leaf);
      builder.insert(leaf2);
      chai.expect(branch.isEmpty()).to.be.false;
      chai.expect(branch.childCount()).to.be.eq(2);
      chai.expect(NodeManager.localHasLeaf(branch, leaf)).to.be.true;
      chai.expect(NodeManager.localHasLeaf(branch, leaf2)).to.be.true;
    });

    it('insert two leaf (with the same identifier, should throw)', () => {
      const leaf = new SE_LEAF('id', () => null);
      const leaf2 = new SE_LEAF('id', () => null);
      builder.insert(leaf);
      chai.expect(() => builder.insert(leaf2)).to.throw();
    });

    it('insert a branch', () => {
      const newBranch = new SE_BRANCH('id');
      builder.insert(newBranch);
      chai.expect(branch.isEmpty()).to.be.false;
      chai.expect(branch.childCount()).to.be.eq(1);
      chai.expect(NodeManager.localHasBranch(branch, 'id')).to.be.true;
    });

    it('insert two branch', () => {
      const newBranch = new SE_BRANCH('id');
      const newBranch2 = new SE_BRANCH('id2');
      builder.insert(newBranch);
      builder.insert(newBranch2);
      chai.expect(branch.isEmpty()).to.be.false;
      chai.expect(branch.childCount()).to.be.eq(2);
      chai.expect(NodeManager.localHasBranch(branch, 'id')).to.be.true;
      chai.expect(NodeManager.localHasBranch(branch, 'id2')).to.be.true;
    });

    it('insert two branch (with same identifier)', () => {
      const newBranch = new SE_BRANCH('id');
      const newBranch2 = new SE_BRANCH('id');
      builder.insert(newBranch);
      builder.insert(newBranch2);
      chai.expect(branch.isEmpty()).to.be.false;
      chai.expect(branch.childCount()).to.be.eq(2);
      chai.expect(NodeManager.localHasBranch(branch, 'id')).to.be.true;
      chai.expect(NodeManager.localBranchCount(branch, 'id')).to.be.eq(2);
    });
  });

  describe('advanced', () => {
    let root: SE_ROOT;
    let builder: Builder;
    let sentinel: SE_SENTINEL;

    beforeEach(() => {
      root = new SE_ROOT();
      builder = new Builder(root);
      sentinel = new SE_SENTINEL('filepath');
      builder.insert(sentinel);
      builder.moveHeadTo(sentinel);
    });

    it('insert two leaf with the same identifier in to different branch', async () => {
      const newBranch = new SE_BRANCH('id');
      const newBranch2 = new SE_BRANCH('id');
      const leaf = new SE_LEAF('leaf', () => null);
      const leaf2 = new SE_LEAF('leaf', () => null);
      builder.insert(newBranch);
      builder.insert(newBranch2);
      builder.moveHeadTo(newBranch);
      builder.insert(leaf);
      builder.moveHeadBack();
      builder.moveHeadTo(newBranch2);
      builder.insert(leaf2);

      chai.expect(await NodeManager.getLeavesCount(root)).to.be.eq(2);
      await chai.expect(builder.checkDuplicatedLeaves()).to.be.rejected;
    });
  });
});

describe('check way construction', () => {
  it('basic leaf inside branch', () => {
    const branch = new SE_BRANCH('branch');
    const leaf = new SE_LEAF('leaf', () => {});
    branch.addNode(leaf);
    expect(branch.getWay()).to.be.empty;
    expect(leaf.getWay()).to.has.a.lengthOf(1);
    expect(leaf.getWay()[0]).to.be.deep.eq(branch);
  });

  it('basic leaf inside sentinel', () => {
    const sent = new SE_SENTINEL('file');
    const leaf = new SE_LEAF('leaf', () => {});
    sent.addNode(leaf);
    expect(sent.getWay()).to.be.empty;
    expect(leaf.getWay()).to.has.a.lengthOf(1);
    expect(leaf.getWay()[0]).to.be.deep.eq(sent);
  });

  it('basic leaf inside branch inside sentinel', () => {
    const sent = new SE_SENTINEL('file');
    const branch = new SE_BRANCH('branch');
    const leaf = new SE_LEAF('leaf', () => {});
    sent.addNode(branch);
    branch.addNode(leaf);
    expect(sent.getWay()).to.be.empty;
    expect(branch.getWay()).to.has.a.lengthOf(1);
    expect(branch.getWay()[0]).to.be.deep.eq(sent);
    expect(leaf.getWay()).to.has.a.lengthOf(2);
    expect(leaf.getWay()[0]).to.be.deep.eq(sent);
    expect(leaf.getWay()[1]).to.be.deep.eq(branch);
    expect(leaf.fullIdentifier).to.be.eq('branch:leaf');
  });

  it('basic leaf inside branch inside  (reverse insert)', () => {
    const sent = new SE_SENTINEL('file');
    const branch = new SE_BRANCH('branch');
    const leaf = new SE_LEAF('leaf', () => {});
    branch.addNode(leaf);
    sent.addNode(branch);
    expect(sent.getWay()).to.be.empty;
    expect(branch.getWay()).to.has.a.lengthOf(1);
    expect(branch.getWay()[0]).to.be.deep.eq(sent);
    expect(leaf.getWay()).to.has.a.lengthOf(2);
    expect(leaf.getWay()[0]).to.be.deep.eq(sent);
    expect(leaf.getWay()[1]).to.be.deep.eq(branch);
    expect(leaf.fullIdentifier).to.be.eq('branch:leaf');
  });

  it('basic leaf inside 2 branches inside  (reverse insert)', () => {
    const sent = new SE_SENTINEL('file');
    const branch = new SE_BRANCH('branch');
    const branch2 = new SE_BRANCH('branch2');
    const leaf = new SE_LEAF('leaf', () => {});
    branch.addNode(leaf);
    branch2.addNode(branch);
    sent.addNode(branch2);
    expect(sent.getWay()).to.be.empty;
    expect(branch2.getWay()).to.has.a.lengthOf(1);
    expect(branch2.getWay()[0]).to.be.deep.eq(sent);
    expect(branch.getWay()).to.has.a.lengthOf(2);
    expect(branch.getWay()[0]).to.be.deep.eq(sent);
    expect(branch.getWay()[1]).to.be.deep.eq(branch2);
    expect(leaf.getWay()).to.has.a.lengthOf(3);
    expect(leaf.getWay()[0]).to.be.deep.eq(sent);
    expect(leaf.getWay()[1]).to.be.deep.eq(branch2);
    expect(leaf.getWay()[2]).to.be.deep.eq(branch);
    expect(leaf.fullIdentifier).to.be.eq('branch2:branch:leaf');
  });
});
