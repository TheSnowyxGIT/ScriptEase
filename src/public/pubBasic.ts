import { builder } from '../singletons';
import SE_BRANCH from '../Tree/Branch';
import SE_LEAF, { LeafExec } from '../Tree/Leaf';

/**
 * Adds a new leaf node to the script tree.
 */
export function leaf(identifier: string, exec: LeafExec) {
  const leaf = new SE_LEAF(identifier, exec);
  builder.insert(leaf);
}

/**
 * Adds a new branch node to the script tree.
 */
export function branch(identifier: string, after: () => void) {
  const branch = new SE_BRANCH(identifier);
  builder.insert(branch);
  builder.moveHeadTo(branch);
  after();
  builder.moveHeadBack();
}
